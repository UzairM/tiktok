import { Router, RequestHandler } from 'express'
import { PlantService } from '../services/plant/plant.service'
import { CreatePlantDto } from '../types/plant'
import { validateAuth } from '../middleware/auth'

const router = Router()
const plantService = new PlantService()

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

router.post('/', validateAuth, createPlant)
router.get('/', validateAuth, getPlants)
router.get('/:id', validateAuth, getPlantById)
router.delete('/:id', validateAuth, deletePlant)

export default router 