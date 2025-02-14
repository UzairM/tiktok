import { db } from '../../config/firebase'
import { Plant, CreatePlantDto } from '../../types/plant'

export class PlantService {
  private readonly collection = 'plants'

  async createPlant(userId: string, dto: CreatePlantDto): Promise<Plant> {
    const plantData: Omit<Plant, 'id'> = {
      userId,
      name: dto.name,
      type: dto.type,
      createdAt: Date.now()
    }

    const docRef = await db.collection(this.collection).add(plantData)
    return { id: docRef.id, ...plantData }
  }

  async getPlantsByUserId(userId: string): Promise<Plant[]> {
    const q = db.collection(this.collection).where('userId', '==', userId)
    const querySnapshot = await q.get()
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Plant))
  }

  async getPlantById(plantId: string): Promise<Plant | null> {
    const docRef = db.collection(this.collection).doc(plantId)
    const docSnap = await docRef.get()
    
    if (!docSnap.exists) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Plant
  }

  async deletePlant(plantId: string): Promise<void> {
    await db.collection(this.collection).doc(plantId).delete()
  }
} 