import { StorageService, StorageConfig } from './types';
import { S3StorageService } from './s3Storage';

export function createStorageService(
  config: StorageConfig & { cloudFrontDomain: string }
): StorageService {
  return new S3StorageService(config);
}

// Export types
export type { StorageService, StorageConfig }; 