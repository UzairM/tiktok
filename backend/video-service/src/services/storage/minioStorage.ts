import { Client } from 'minio';
import { StorageService, StorageConfig, UploadedFile } from './types';

export class MinioStorageService implements StorageService {
  private client: Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.client = new Client({
      endPoint: config.endpoint || 'localhost',
      port: 9000, // Default MinIO port
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
    this.bucket = config.bucket;
  }

  async uploadFile(file: UploadedFile, key: string): Promise<{ url: string }> {
    try {
      await this.client.putObject(
        this.bucket,
        key,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );

      // Get temporary URL that expires in 7 days
      const url = await this.getSignedUrl(key);
      return { url };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      // URL expires in 7 days
      return await this.client.presignedGetObject(this.bucket, key, 7 * 24 * 60 * 60);
    } catch (error) {
      console.error('Get signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, key);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileMetadata(key: string): Promise<{ size: number; contentType: string; lastModified: Date; } | null> {
    try {
      const stat = await this.client.statObject(this.bucket, key);
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