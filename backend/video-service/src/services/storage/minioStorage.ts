import { Client } from 'minio';
import { StorageService, StorageConfig, UploadedFile } from './types';

const REQUIRED_BUCKETS = ['uploads', 'videos', 'thumbnails'];

export class MinioStorageService implements StorageService {
  private client: Client;

  constructor(config: StorageConfig) {
    const externalHost = process.env.EXTERNAL_HOST || '10.10.2.2';
    this.client = new Client({
      endPoint: externalHost,
      port: 9000,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
      region: 'us-east-1'
    });
    this.initBuckets().catch(console.error);
  }

  private async initBuckets(): Promise<void> {
    try {
      // Create all required buckets
      for (const bucketName of REQUIRED_BUCKETS) {
        const exists = await this.client.bucketExists(bucketName);
        if (!exists) {
          await this.client.makeBucket(bucketName);
          console.log(`Created bucket: ${bucketName}`);
        } else {
          console.log(`Bucket already exists: ${bucketName}`);
        }
      }
    } catch (error) {
      console.error('Failed to initialize buckets:', error);
      throw error;
    }
  }

  async uploadFile(file: UploadedFile, key: string): Promise<{ url: string }> {
    try {
      // Extract bucket name from the key (e.g., "uploads/123/file.mp4" -> "uploads")
      const [bucketName, ...keyParts] = key.split('/');
      const actualKey = keyParts.join('/');

      if (!REQUIRED_BUCKETS.includes(bucketName)) {
        throw new Error(`Invalid bucket: ${bucketName}`);
      }

      await this.client.putObject(
        bucketName,
        actualKey,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      // Get temporary URL that expires in 7 days
      const url = await this.getSignedUrl(bucketName, actualKey);
      return { url };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const [bucketName, ...keyParts] = key.split('/');
      const actualKey = keyParts.join('/');

      if (!REQUIRED_BUCKETS.includes(bucketName)) {
        throw new Error(`Invalid bucket: ${bucketName}`);
      }

      const dataStream = await this.client.getObject(bucketName, actualKey);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  }

  private async getSignedUrl(bucketName: string, key: string): Promise<string> {
    try {
      // URL expires in 7 days
      const url = await this.client.presignedGetObject(
        bucketName,
        key,
        7 * 24 * 60 * 60,
        {
          'response-content-type': 'video/mp4',
          'response-content-disposition': 'inline',
        }
      );
      console.log('Generated signed URL:', url); // Debug log
      return url;
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const [bucketName, ...keyParts] = key.split('/');
      const actualKey = keyParts.join('/');

      if (!REQUIRED_BUCKETS.includes(bucketName)) {
        throw new Error(`Invalid bucket: ${bucketName}`);
      }

      await this.client.removeObject(bucketName, actualKey);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileMetadata(key: string): Promise<{ size: number; contentType: string; lastModified: Date; } | null> {
    try {
      const [bucketName, ...keyParts] = key.split('/');
      const actualKey = keyParts.join('/');

      if (!REQUIRED_BUCKETS.includes(bucketName)) {
        throw new Error(`Invalid bucket: ${bucketName}`);
      }

      const stat = await this.client.statObject(bucketName, actualKey);
      return {
        size: stat.size,
        contentType: stat.metaData['content-type'] || 'application/octet-stream',
        lastModified: stat.lastModified,
      };
    } catch (error) {
      if ((error as any).code === 'NotFound') {
        return null;
      }
      throw error;
    }
  }
} 