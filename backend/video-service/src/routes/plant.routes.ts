import { Router, RequestHandler } from 'express'
import { PlantService } from '../services/plant/plant.service'
import { CreatePlantDto } from '../types/plant'
import { validateAuth } from '../middleware/auth'
import { db } from '../config/firebase'
import { AIService } from '../services/ai/ai.service'
import { MediaItem } from '../types/media'

const router = Router()
const plantService = new PlantService()
const aiService = new AIService()

// Create plant
const createPlant: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id
    const dto = req.body as CreatePlantDto
    const plant = await plantService.createPlant(userId, dto)
    res.status(201).json(plant)
  } catch (error) {
    console.error('Error creating plant:', error)
    res.status(500).json({ message: 'Failed to create plant' })
  }
}

// Get all plants
const getPlants: RequestHandler = async (req, res) => {
  try {
    const userId = req.user!.id
    const plants = await plantService.getPlantsByUserId(userId)
    res.json(plants)
  } catch (error) {
    console.error('Error fetching plants:', error)
    res.status(500).json({ message: 'Failed to fetch plants' })
  }
}

// Get plant by ID
const getPlantById: RequestHandler = async (req, res) => {
  try {
    const plant = await plantService.getPlantById(req.params.id)
    if (!plant) {
      res.status(404).json({ message: 'Plant not found' })
      return
    }
    if (plant.userId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized' })
      return
    }
    res.json(plant)
  } catch (error) {
    console.error('Error fetching plant:', error)
    res.status(500).json({ message: 'Failed to fetch plant' })
  }
}

// Delete plant
const deletePlant: RequestHandler = async (req, res) => {
  try {
    const plant = await plantService.getPlantById(req.params.id)
    if (!plant) {
      res.status(404).json({ message: 'Plant not found' })
      return
    }
    if (plant.userId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized' })
      return
    }
    await plantService.deletePlant(req.params.id)
    res.status(204).end()
  } catch (error) {
    console.error('Error deleting plant:', error)
    res.status(500).json({ message: 'Failed to delete plant' })
  }
}

// Analyze plant growth
const analyzeGrowth: RequestHandler = async (req, res) => {
  try {
    const { plantId } = req.params
    console.log('Starting growth analysis for plant:', plantId)
    
    // Get all media for this plant, ordered by upload time
    console.log('Fetching media for plant...')
    const mediaSnap = await db.collection('media')
      .where('plantId', '==', plantId)
      .orderBy('uploadedAt', 'asc')
      .get()

    const mediaItems = mediaSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MediaItem))

    console.log('Found media items:', {
      count: mediaItems.length,
      mediaIds: mediaItems.map(m => m.id),
      types: mediaItems.map(m => m.type)
    })

    if (mediaItems.length === 0) {
      console.log('No media found for plant:', plantId)
      res.status(404).json({ message: 'No media found for this plant' })
      return
    }

    // Extract image URLs (for videos, we'll use the first frame)
    console.log('Extracting image URLs...')
    const imageUrls = await Promise.all(mediaItems.map(async (media) => {
      if (media.type === 'video') {
        console.log('Processing video URL:', media.id)
        // For videos, we should extract a frame, but for now just use the first frame
        // TODO: Implement proper video frame extraction
        return media.mediaUrl
      }
      console.log('Processing image URL:', media.id)
      return media.mediaUrl
    }))

    console.log('Prepared URLs for analysis:', imageUrls.length)

    // Analyze growth progression
    const prompt = `You are an AI model designed to analyze plant growth progression. 
    I will provide you with a series of plant images in chronological order. 
    Please analyze the growth progression and provide:
    1. Growth Rate: Estimate the growth rate and changes between images
    2. Key Changes: Note significant changes in appearance, size, or health
    3. Timeline: Create a timeline of observed changes
    4. Recommendations: Suggest care adjustments based on the growth pattern
    
    The images are ordered from oldest to newest, spanning a period of ${
      Math.round((mediaItems[mediaItems.length - 1].uploadedAt - mediaItems[0].uploadedAt) / (1000 * 60 * 60 * 24))
    } days.`

    console.log('Starting AI analysis with prompt length:', prompt.length)
    const analysis = await aiService.analyzeGrowthProgression(imageUrls, prompt)
    console.log('Received analysis response length:', analysis.length)

    // Store the analysis
    console.log('Storing analysis in Firestore...')
    await db.collection('plantGrowthAnalyses').doc(plantId).set({
      content: analysis,
      analyzedAt: Date.now(),
      mediaCount: mediaItems.length,
      plantId,
    })
    console.log('Analysis stored successfully')

    res.json({ message: 'Growth analysis completed', analysis })
    return
  } catch (error) {
    console.error('Error analyzing plant growth:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    res.status(500).json({ message: 'Failed to analyze plant growth' })
    return
  }
}

// Get plant growth analysis
const getGrowthAnalysis: RequestHandler = async (req, res) => {
  try {
    const { plantId } = req.params
    console.log('Fetching growth analysis for plant:', plantId)
    
    const analysisDoc = await db.collection('plantGrowthAnalyses')
      .doc(plantId)
      .get()

    console.log('Analysis doc exists:', analysisDoc.exists)

    if (!analysisDoc.exists) {
      res.status(404).json({ message: 'No growth analysis found' })
      return
    }

    const data = analysisDoc.data()
    console.log('Analysis data:', data)

    res.json(data)
    return
  } catch (error) {
    console.error('Error fetching growth analysis:', error)
    res.status(500).json({ message: 'Failed to fetch growth analysis' })
    return
  }
}

// Mount routes
router.post('/', validateAuth, createPlant)
router.get('/', validateAuth, getPlants)
router.get('/:id', validateAuth, getPlantById)
router.delete('/:id', validateAuth, deletePlant)
router.post('/:plantId/analyze-growth', validateAuth, analyzeGrowth)
router.get('/:plantId/growth', validateAuth, getGrowthAnalysis)

export default router 