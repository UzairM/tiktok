import { StorageService, StorageConfig } from './types';
import { MinioStorageService } from './minioStorage';
import { S3StorageService } from './s3Storage';

export type StorageProvider = 'minio' | 's3';

export function createStorageService(
  provider: StorageProvider,
  config: StorageConfig & { cloudFrontDomain: string }
): StorageService {
  switch (provider) {
    case 's3':
      return new S3StorageService(config);
    case 'minio':
      return new MinioStorageService(config as StorageConfig);
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

// Export types
export type { StorageService, StorageConfig }; 