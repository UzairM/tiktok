import { createStorageService } from '../services/storage';
import dotenv from 'dotenv';

dotenv.config();

export const storageService = createStorageService('s3', {
  bucket: process.env.S3_BUCKET_NAME || 'tiktok-clone',
  region: process.env.AWS_REGION || 'us-east-1',
  accessKey: process.env.AWS_ACCESS_KEY_ID || '',
  secretKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  useSSL: true,
  cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN || '',
}); 