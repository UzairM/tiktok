import { Router, RequestHandler } from 'express';
import { MediaService } from '../services/media/media.service';
import { validateAuth } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { CreateMediaDto } from '../types/media';
import { storageService } from '../config/storage';
import { randomBytes } from 'crypto';

const router = Router();
const mediaService = new MediaService();

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

    // Create media record in database
    const dto: CreateMediaDto = {
      plantId,
      mediaUrl: url // Store the full CloudFront URL
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

// Routes
router.post('/', validateAuth, uploadMiddleware, createMedia);
router.get('/plant/:plantId', validateAuth, getMediaByPlantId);
router.get('/user', validateAuth, getMediaByUserId);
router.delete('/:mediaId', validateAuth, deleteMedia);

export default router; 