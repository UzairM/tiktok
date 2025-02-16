import { Router, RequestHandler } from 'express';
import { MediaService } from '../services/media/media.service';
import { validateAuth } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { CreateMediaDto, MediaItem } from '../types/media';
import { storageService } from '../config/storage';
import { randomBytes } from 'crypto';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { AIService } from '../services/ai/ai.service';

const router = Router();
const mediaService = new MediaService();
const aiService = new AIService();

function generateId(): string {
  return randomBytes(12).toString('hex');
}

const createMedia: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const plantId = req.body.plantId;
    const type = req.body.type;

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!plantId) {
      res.status(400).json({ message: 'Plant ID is required' });
      return;
    }

    // Generate a unique ID for the media
    const mediaId = generateId();
    
    // Upload file to storage
    const fileExtension = type === 'image' ? 'jpg' : 'mp4';
    const key = `uploads/${userId}/${mediaId}/media.${fileExtension}`;
    const { url } = await storageService.uploadFile(req.file, key);

    let aiResult;
    if (type === 'image') {
      // For images, analyze immediately
      try {
        aiResult = await aiService.analyzeImage(url);
      } catch (error) {
        console.error('Error analyzing image:', error);
        // Continue without AI results if analysis fails
      }
    }
    // For videos, analysis will be handled by the video processor

    // Create media record in database
    const dto: CreateMediaDto = {
      plantId,
      mediaUrl: url,
      type,
      aiResult
    };

    const media = await mediaService.createMedia(userId, dto);
    res.status(201).json(media);
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json({ message: 'Failed to create media' });
  }
};

const getMediaByPlantId: RequestHandler = async (req, res) => {
  try {
    const { plantId } = req.params;
    const media = await mediaService.getMediaByPlantId(plantId);
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

const getMediaByUserId: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id;
    const media = await mediaService.getMediaByUserId(userId);
    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

const getMediaById: RequestHandler = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const media = await mediaService.getMediaById(mediaId);
    
    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ message: 'Failed to fetch media' });
  }
};

const deleteMedia: RequestHandler = async (req, res) => {
  try {
    const { mediaId } = req.params;
    await mediaService.deleteMedia(mediaId);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ message: 'Failed to delete media' });
  }
};

const getMediaFeed: RequestHandler = async (req, res) => {
  try {
    const { cursor } = req.query;
    const pageSize = 10;

    let query = mediaService.getFeedQuery();

    if (cursor) {
      const cursorDoc = await mediaService.getMediaById(cursor as string);
      if (cursorDoc) {
        query = query.startAfter(cursorDoc);
      }
    }

    const snapshot = await query.limit(pageSize).get();
    const media = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    } as MediaItem));

    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    
    res.json({
      media,
      nextCursor: lastDoc?.id
    });
  } catch (error) {
    console.error('Error fetching media feed:', error);
    res.status(500).json({ message: 'Failed to fetch media feed' });
  }
};

const analyzeHealth: RequestHandler = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const media = await mediaService.getMediaById(mediaId);

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    if (media.userId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Analyze with GPT-4V
    const aiResult = await aiService.analyzeImage(media.mediaUrl);
    
    if (!aiResult) {
      res.status(500).json({ message: 'Failed to analyze health' });
      return;
    }
    
    // Save the raw response
    await mediaService.updateAIResult(mediaId, aiResult);

    res.json({ message: 'Health analysis completed' });
  } catch (error) {
    console.error('Error analyzing health:', error);
    res.status(500).json({ message: 'Failed to analyze health' });
  }
};

const analyzeGrowth: RequestHandler = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const media = await mediaService.getMediaById(mediaId);

    if (!media) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    if (media.userId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    // Analyze with GPT-4V
    const aiResult = await aiService.analyzeImage(media.mediaUrl);
    
    if (!aiResult) {
      res.status(500).json({ message: 'Failed to analyze growth' });
      return;
    }
    
    // Save the raw response
    await mediaService.updateAIResult(mediaId, aiResult);

    res.json({ message: 'Growth analysis completed' });
  } catch (error) {
    console.error('Error analyzing growth:', error);
    res.status(500).json({ message: 'Failed to analyze growth' });
  }
};

// Routes
router.post('/', validateAuth, uploadMiddleware, createMedia);
router.get('/feed', validateAuth, getMediaFeed);
router.get('/plant/:plantId', validateAuth, getMediaByPlantId);
router.get('/user', validateAuth, getMediaByUserId);
router.get('/:mediaId', validateAuth, getMediaById);
router.delete('/:mediaId', validateAuth, deleteMedia);
router.post('/:mediaId/analyze/health', validateAuth, analyzeHealth);
router.post('/:mediaId/analyze/growth', validateAuth, analyzeGrowth);

export default router; 