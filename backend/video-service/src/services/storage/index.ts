import { StorageService, StorageConfig } from './types';
import { MinioStorageService } from './minioStorage';

export type StorageProvider = 'minio' | 's3';

export function createStorageService(
  provider: StorageProvider,
  config: StorageConfig
): StorageService {
  switch (provider) {
    case 'minio':
      return new MinioStorageService(config);
    case 's3':
      // Future implementation
      throw new Error('S3 storage not implemented yet');
    default:
      throw new Error(`Unsupported storage provider: ${provider}`);
  }
}

// Export types
export type { StorageService, StorageConfig }; 