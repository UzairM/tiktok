import { db } from '../../config/firebase'
import { MediaItem, CreateMediaDto } from '../../types/media'
import type { Query, DocumentData } from 'firebase-admin/firestore'

export class MediaService {
  private readonly collection = 'media'

  async createMedia(userId: string, dto: CreateMediaDto): Promise<MediaItem> {
    const mediaData: Omit<MediaItem, 'id'> = {
      userId,
      plantId: dto.plantId,
      mediaUrl: dto.mediaUrl,
      type: dto.type,
      uploadedAt: Date.now(),
      ...(dto.aiResult && { aiResult: dto.aiResult })
    }

    const docRef = await db.collection(this.collection).add(mediaData)
    return { id: docRef.id, ...mediaData }
  }

  async updateAIResult(mediaId: string, aiResult: MediaItem['aiResult']): Promise<void> {
    // Filter out undefined values
    const updateData = {
      aiResult: Object.fromEntries(
        Object.entries(aiResult || {}).filter(([_, value]) => value !== undefined)
      )
    };

    // Only update if there are valid values
    if (Object.keys(updateData.aiResult).length > 0) {
      const docRef = db.collection(this.collection).doc(mediaId);
      await docRef.update(updateData);
    }
  }

  async getMediaByUserId(userId: string): Promise<MediaItem[]> {
    const q = db.collection(this.collection).where('userId', '==', userId)
    const querySnapshot = await q.get()
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MediaItem))
  }

  async getMediaByPlantId(plantId: string): Promise<MediaItem[]> {
    const q = db.collection(this.collection).where('plantId', '==', plantId)
    const querySnapshot = await q.get()
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MediaItem))
  }

  async getMediaById(mediaId: string): Promise<MediaItem | null> {
    const docRef = db.collection(this.collection).doc(mediaId)
    const docSnap = await docRef.get()
    
    if (!docSnap.exists) return null
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as MediaItem
  }

  async deleteMedia(mediaId: string): Promise<void> {
    await db.collection(this.collection).doc(mediaId).delete()
  }

  getFeedQuery(): Query<DocumentData> {
    return db.collection(this.collection)
      .orderBy('uploadedAt', 'desc')
  }
} 