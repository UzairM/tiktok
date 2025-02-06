import { createStorageService } from '../services/storage';
import dotenv from 'dotenv';

dotenv.config();

export const storageService = createStorageService('minio', {
  bucket: process.env.MINIO_BUCKET_NAME || 'videos',
  endpoint: process.env.MINIO_ENDPOINT || 'localhost',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  useSSL: process.env.MINIO_USE_SSL === 'true',
}); 