declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      S3_BUCKET_NAME: string;
      CLOUDFRONT_DOMAIN: string;
    }
  }
}

export {}; 