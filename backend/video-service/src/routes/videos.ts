import { Router, Response } from 'express';
import { nanoid } from 'nanoid';
import { uploadMiddleware } from '../middleware/upload';
import { storageService } from '../config/storage';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { NextFunction } from 'express';

const router = Router();

router.post('/upload', authMiddleware, (req: AuthRequest, res: Response) => {
  uploadMiddleware(req, res, ((err: unknown) => {
    (async () => {
      try {
        if (err) {
          res.status(400).json({ 
            message: err instanceof Error ? err.message : 'Upload error',
            code: 'upload/invalid-file'
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({ 
            message: 'No file uploaded',
            code: 'upload/no-file'
          });
          return;
        }

        const fileId = nanoid();
        const key = `videos/${req.user!.uid}/${fileId}`;

        const { url } = await storageService.uploadFile(req.file, key);

        // Save metadata to Firestore
        await db.collection('videos').doc(fileId).set({
          userId: req.user!.uid,
          url,
          title: req.body.title || 'Untitled',
          timestamp: new Date().toISOString(),
          status: 'ready',
          likes: 0,
          views: 0
        });

        res.status(201).json({
          id: fileId,
          url,
          status: 'ready'
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ 
          message: 'Failed to upload video',
          code: 'upload/server-error'
        });
      }
    })();
  }) as NextFunction);
});

export default router; 