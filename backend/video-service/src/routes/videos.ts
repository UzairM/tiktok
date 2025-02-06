import { Router, Response } from 'express';
import { randomBytes } from 'crypto';
import { uploadMiddleware } from '../middleware/upload';
import { storageService } from '../config/storage';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { db } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { NextFunction } from 'express';
import { WorkerService } from '../services/worker';

const router = Router();
const workerService = new WorkerService(storageService);

function generateId(): string {
  return randomBytes(12).toString('hex');
}

// Start worker service
setInterval(() => {
  workerService.start().catch(error => {
    console.error('Worker service error:', error);
  });
}, 5000); // Check for new videos every 5 seconds

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

        const fileId = generateId();
        const originalKey = `uploads/${req.user!.uid}/${fileId}/original.mp4`;

        // Upload original file to storage
        await storageService.uploadFile(req.file, originalKey);

        // Save initial metadata to Firestore
        await db.collection('videos').doc(fileId).set({
          userId: req.user!.uid,
          originalKey,
          title: req.body.title || 'Untitled',
          description: req.body.description || '',
          timestamp: new Date().toISOString(),
          status: 'pending',
          likes: 0,
          views: 0
        });

        res.status(201).json({
          id: fileId,
          status: 'pending'
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

// Get video feed
router.get('/feed', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { cursor } = req.query;
    const pageSize = 10;

    let query = db.collection('videos')
      .where('status', '==', 'ready')
      .orderBy('timestamp', 'desc')
      .limit(pageSize);

    if (cursor) {
      const cursorDoc = await db.collection('videos').doc(cursor as string).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.get();
    const videos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    
    res.json({
      videos,
      nextCursor: lastDoc?.id
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch videos',
      code: 'feed/server-error'
    });
  }
});

// Toggle like on a video
router.post('/:videoId/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    const userId = req.user!.uid;

    const userLikesRef = db.collection('users').doc(userId).collection('likes').doc(videoId);
    const videoRef = db.collection('videos').doc(videoId);

    const userLikeDoc = await userLikesRef.get();
    const isLiked = userLikeDoc.exists;

    if (isLiked) {
      await Promise.all([
        videoRef.update({ likes: FieldValue.increment(-1) }),
        userLikesRef.delete()
      ]);
    } else {
      await Promise.all([
        videoRef.update({ likes: FieldValue.increment(1) }),
        userLikesRef.set({ timestamp: new Date().toISOString() })
      ]);
    }

    res.json({ isLiked: !isLiked });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({
      message: 'Failed to toggle like',
      code: 'like/server-error'
    });
  }
});

// Get user's videos
router.get('/user/:userId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    const snapshot = await db.collection('videos')
      .where('userId', '==', userId)
      .where('status', '==', 'ready')
      .orderBy('timestamp', 'desc')
      .get();

    const videos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({ videos });
  } catch (error) {
    console.error('User videos error:', error);
    res.status(500).json({
      message: 'Failed to fetch user videos',
      code: 'videos/server-error'
    });
  }
});

// Get a single video by ID
router.get('/:videoId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { videoId } = req.params;
    
    const videoDoc = await db.collection('videos').doc(videoId).get();
    
    if (!videoDoc.exists) {
      res.status(404).json({
        message: 'Video not found',
        code: 'video/not-found'
      });
      return;
    }

    // Get the user's like status for this video
    const userLikeDoc = req.user ? 
      await db.collection('users').doc(req.user.uid).collection('likes').doc(videoId).get() :
      null;

    const video = {
      id: videoDoc.id,
      ...videoDoc.data(),
      isLiked: userLikeDoc?.exists || false
    };

    res.json({ video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      message: 'Failed to fetch video',
      code: 'video/server-error'
    });
  }
});

export default router; 