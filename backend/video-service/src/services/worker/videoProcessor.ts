import ffmpeg from 'fluent-ffmpeg';
import { StorageService } from '../storage/types';
import { db } from '../../config/firebase';
import path from 'path';
import os from 'os';
import fs from 'fs';

interface ProcessVideoOptions {
  videoId: string;
  inputPath: string;
  outputKey: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export class VideoProcessor {
  constructor(private storage: StorageService) {}

  async processVideo({ videoId, inputPath, outputKey }: ProcessVideoOptions): Promise<void> {
    const tempDir = path.join(os.tmpdir(), 'video-processing');
    const outputPath = path.join(tempDir, `${videoId}.mp4`);
    const thumbnailPath = path.join(tempDir, `${videoId}.jpg`);

    try {
      // Create temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath);

      // Generate thumbnail
      await this.generateThumbnail(inputPath, thumbnailPath);
      const thumbnailKey = `thumbnails/${videoId}.jpg`;
      const { url: thumbnailUrl } = await this.storage.uploadFile(
        {
          fieldname: 'thumbnail',
          originalname: `${videoId}.jpg`,
          encoding: '7bit',
          mimetype: 'image/jpeg',
          buffer: await fs.promises.readFile(thumbnailPath),
          size: (await fs.promises.stat(thumbnailPath)).size,
        },
        thumbnailKey
      );

      // Process video
      await this.transcodeVideo(inputPath, outputPath);
      const { url: videoUrl } = await this.storage.uploadFile(
        {
          fieldname: 'video',
          originalname: `${videoId}.mp4`,
          encoding: '7bit',
          mimetype: 'video/mp4',
          buffer: await fs.promises.readFile(outputPath),
          size: (await fs.promises.stat(outputPath)).size,
        },
        outputKey
      );

      // Update video metadata in Firestore
      const videoRef = db.collection('videos').doc(videoId);
      await videoRef.update({
        status: 'ready',
        url: videoUrl,
        thumbnailUrl,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
      });
    } finally {
      // Cleanup temp files
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (fs.existsSync(thumbnailPath)) fs.unlinkSync(thumbnailPath);
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
    }
  }

  private getVideoMetadata(inputPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err: Error | null, metadata: any) => {
        if (err) return reject(err);
        
        const videoStream = metadata.streams.find((s: any) => s.codec_type === 'video');
        if (!videoStream) return reject(new Error('No video stream found'));

        resolve({
          duration: Math.floor(metadata.format.duration || 0),
          width: videoStream.width || 0,
          height: videoStream.height || 0,
        });
      });
    });
  }

  private generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ['50%'],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '720x?',
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
  }

  private transcodeVideo(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',         // Video codec
          '-crf 23',              // Quality (lower = better)
          '-preset medium',       // Encoding speed preset
          '-c:a aac',            // Audio codec
          '-b:a 128k',           // Audio bitrate
          '-movflags +faststart', // Enable fast start for web playback
          '-y',                   // Overwrite output file
        ])
        .size('720x?')           // Resize to 720p
        .autopad()               // Add padding if needed
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
  }
} 