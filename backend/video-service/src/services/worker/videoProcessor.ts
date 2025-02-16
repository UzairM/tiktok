import ffmpeg from 'fluent-ffmpeg';
import { StorageService } from '../storage/types';
import { db } from '../../config/firebase';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { AIService } from '../ai/ai.service';
import { MediaItem } from '../../types/media';

interface ProcessVideoOptions {
  videoId: string;
  inputPath: string;
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

interface TranscodeOptions {
  resolution: string;
  bitrate: string;
  maxrate: string;
  bufsize: string;
  profile: string;
  outputPath: string;
  segmentPath: string;
}

export class VideoProcessor {
  private aiService: AIService;

  constructor(private storage: StorageService) {
    this.aiService = new AIService();
  }

  async processVideo({ videoId, inputPath }: ProcessVideoOptions): Promise<void> {
    const tempDir = path.join(os.tmpdir(), 'video-processing');
    const videoDir = path.join(tempDir, videoId);
    const thumbnailPath = path.join(tempDir, `${videoId}.jpg`);
    const framesDir = path.join(tempDir, `${videoId}-frames`);

    try {
      // Create temp directories
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      if (!fs.existsSync(videoDir)) {
        fs.mkdirSync(videoDir, { recursive: true });
      }
      if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
      }

      // Get video metadata
      const metadata = await this.getVideoMetadata(inputPath);

      // Extract frames for AI analysis
      const frames = await this.extractFrames(inputPath, framesDir);
      
      // Upload frames and get URLs
      const frameUrls = await Promise.all(
        frames.map(async (frame) => {
          const key = `frames/${videoId}/${path.basename(frame)}`;
          const { url } = await this.storage.uploadFile(
            {
              fieldname: 'frame',
              originalname: path.basename(frame),
              encoding: '7bit',
              mimetype: 'image/jpeg',
              buffer: await fs.promises.readFile(frame),
              size: (await fs.promises.stat(frame)).size,
            },
            key
          );
          return url;
        })
      );

      // Analyze frames with GPT-4o
      const aiResults = await Promise.all(
        frameUrls.map(url => this.aiService.analyzeImage(url))
      );

      // Aggregate AI results
      const aggregatedResult = await this.aggregateAIResults(aiResults);

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

      // Process video into HLS
      const variants = [
        {
          resolution: '1920x1080',
          bitrate: '6000k',
          maxrate: '6000k',
          bufsize: '12000k',
          profile: 'high',
          outputPath: path.join(videoDir, '1080p'),
          segmentPath: '1080p/segment%d.ts'
        },
        {
          resolution: '1280x720',
          bitrate: '2800k',
          maxrate: '2800k',
          bufsize: '5600k',
          profile: 'main',
          outputPath: path.join(videoDir, '720p'),
          segmentPath: '720p/segment%d.ts'
        },
        {
          resolution: '854x480',
          bitrate: '1400k',
          maxrate: '1400k',
          bufsize: '2800k',
          profile: 'main',
          outputPath: path.join(videoDir, '480p'),
          segmentPath: '480p/segment%d.ts'
        },
        {
          resolution: '640x360',
          bitrate: '800k',
          maxrate: '800k',
          bufsize: '1600k',
          profile: 'baseline',
          outputPath: path.join(videoDir, '360p'),
          segmentPath: '360p/segment%d.ts'
        },
        {
          resolution: '426x240',
          bitrate: '400k',
          maxrate: '400k',
          bufsize: '800k',
          profile: 'baseline',
          outputPath: path.join(videoDir, '240p'),
          segmentPath: '240p/segment%d.ts'
        }
      ];

      // Create output directories for each variant
      for (const variant of variants) {
        if (!fs.existsSync(variant.outputPath)) {
          fs.mkdirSync(variant.outputPath, { recursive: true });
        }
      }

      // Process each variant
      await Promise.all(variants.map(variant => this.transcodeVariant(inputPath, variant)));

      // Generate master playlist
      const masterPlaylist = this.generateMasterPlaylist(variants);
      fs.writeFileSync(path.join(videoDir, 'master.m3u8'), masterPlaylist);

      // Upload all HLS files to S3
      const hlsFiles = await this.uploadHLSFiles(videoDir, videoId);
      const masterPlaylistUrl = hlsFiles.find(f => f.key.endsWith('master.m3u8'))?.url;

      if (!masterPlaylistUrl) {
        throw new Error('Failed to get master playlist URL');
      }

      // Update video metadata in Firestore with AI results
      const videoRef = db.collection('videos').doc(videoId);
      await videoRef.update({
        status: 'ready',
        url: masterPlaylistUrl,
        thumbnailUrl,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        variants: variants.map(v => ({
          resolution: v.resolution,
          bitrate: v.bitrate
        })),
        aiResult: aggregatedResult
      });

    } finally {
      // Cleanup temp files
      try {
        if (fs.existsSync(videoDir)) {
          fs.rmSync(videoDir, { recursive: true, force: true });
        }
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
        if (fs.existsSync(framesDir)) {
          fs.rmSync(framesDir, { recursive: true, force: true });
        }
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
    }
  }

  private async transcodeVariant(inputPath: string, options: TranscodeOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-vf scale=${options.resolution}`,
          '-c:v libx264',
          `-b:v ${options.bitrate}`,
          `-maxrate ${options.maxrate}`,
          `-bufsize ${options.bufsize}`,
          `-profile:v ${options.profile}`,
          '-c:a aac',
          '-b:a 128k',
          '-ac 2',
          '-f hls',
          '-hls_time 6',
          '-hls_list_size 0',
          '-hls_segment_filename', path.join(options.outputPath, 'segment%d.ts'),
          '-hls_playlist_type vod'
        ])
        .output(path.join(options.outputPath, 'playlist.m3u8'))
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err))
        .run();
    });
  }

  private generateMasterPlaylist(variants: TranscodeOptions[]): string {
    let playlist = '#EXTM3U\n';
    playlist += '#EXT-X-VERSION:3\n\n';

    variants.forEach(variant => {
      const resolution = variant.resolution;
      const bandwidth = parseInt(variant.bitrate) * 1000;
      playlist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n`;
      playlist += `${variant.segmentPath.split('/')[0]}/playlist.m3u8\n\n`;
    });

    return playlist;
  }

  private async uploadHLSFiles(videoDir: string, videoId: string): Promise<Array<{ key: string; url: string }>> {
    const uploadedFiles: Array<{ key: string; url: string }> = [];
    const baseKey = `videos/${videoId}`;

    // Helper function to upload a single file
    const uploadFile = async (localPath: string, relativePath: string) => {
      const key = `${baseKey}/${relativePath}`;
      const { url } = await this.storage.uploadFile(
        {
          fieldname: 'video',
          originalname: path.basename(localPath),
          encoding: '7bit',
          mimetype: this.getMimeType(localPath),
          buffer: await fs.promises.readFile(localPath),
          size: (await fs.promises.stat(localPath)).size,
        },
        key
      );
      uploadedFiles.push({ key, url });
    };

    // Upload master playlist
    await uploadFile(
      path.join(videoDir, 'master.m3u8'),
      'master.m3u8'
    );

    // Upload variant playlists and segments
    const variants = ['1080p', '720p', '480p', '360p', '240p'];
    for (const variant of variants) {
      const variantDir = path.join(videoDir, variant);
      if (!fs.existsSync(variantDir)) continue;

      const files = fs.readdirSync(variantDir);
      for (const file of files) {
        await uploadFile(
          path.join(variantDir, file),
          `${variant}/${file}`
        );
      }
    }

    return uploadedFiles;
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.m3u8':
        return 'application/vnd.apple.mpegurl';
      case '.ts':
        return 'video/MP2T';
      default:
        return 'application/octet-stream';
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

  private async extractFrames(inputPath: string, outputDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-vf', 'fps=1/2', // Extract one frame every 2 seconds
          '-frame_pts', '1'
        ])
        .output(path.join(outputDir, 'frame-%d.jpg'))
        .on('end', () => {
          // Get list of generated frames
          const frameFiles = fs.readdirSync(outputDir)
            .filter(file => file.startsWith('frame-'))
            .map(file => path.join(outputDir, file));
          resolve(frameFiles);
        })
        .on('error', (err: Error) => reject(err))
        .run();
    });
  }

  private async aggregateAIResults(results: Array<MediaItem['aiResult']>): Promise<MediaItem['aiResult']> {
    return this.aiService.aggregateVideoAnalyses(results);
  }
} 