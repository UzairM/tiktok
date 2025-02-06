import multer from 'multer';
import { Request } from 'express';

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only MP4 and MOV files are allowed.'));
    return;
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
}).single('video'); 