import { Client } from 'minio';
import dotenv from 'dotenv';

dotenv.config();

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

export const MINIO_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'videos';

// Initialize bucket if it doesn't exist
async function initializeBucket(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(MINIO_BUCKET_NAME, 'us-east-1');
      console.log('Bucket created successfully');
    }
  } catch (error) {
    console.error('Error initializing bucket:', error);
  }
}

// Initialize bucket on startup
initializeBucket();

export default minioClient; 