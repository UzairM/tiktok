import { db } from '../../config/firebase';
import { VideoProcessor } from './videoProcessor';
import { StorageService } from '../storage/types';
import path from 'path';
import os from 'os';
import fs from 'fs';

export class WorkerService {
  private processor: VideoProcessor;
  private isProcessing = false;

  constructor(private storage: StorageService) {
    this.processor = new VideoProcessor(storage);
  }

  async start(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Keep processing videos until there are no more pending ones
      let hasMore = true;
      while (hasMore) {
        hasMore = await this.processNextVideo();
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async processNextVideo(): Promise<boolean> {
    try {
      // Get next pending video
      const snapshot = await db.collection('videos')
        .where('status', '==', 'pending')
        .orderBy('timestamp', 'asc')
        .limit(1)
        .get();

      if (snapshot.empty) return false;

      const videoDoc = snapshot.docs[0];
      const videoData = videoDoc.data();
      const tempDir = path.join(os.tmpdir(), 'video-processing');
      const inputPath = path.join(tempDir, `${videoDoc.id}-input.mp4`);

      try {
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }

        console.log('Processing video:', videoDoc.id);

        // Download original video
        const originalFile = await this.storage.downloadFile(videoData.originalKey);
        await fs.promises.writeFile(inputPath, originalFile);

        // Process video
        await this.processor.processVideo({
          videoId: videoDoc.id,
          inputPath,
        });

        console.log('Video processed successfully:', videoDoc.id);

        // Delete original file
        await this.storage.deleteFile(videoData.originalKey);
        return true;
      } catch (error) {
        console.error('Error processing video:', error);
        await videoDoc.ref.update({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return true; // Continue to next video even if this one failed
      } finally {
        // Cleanup temp files
        try {
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        } catch (error) {
          console.error('Error cleaning up temp file:', error);
        }
      }
    } catch (error) {
      console.error('Error in processNextVideo:', error);
      return false;
    }
  }
} 