export interface MediaItem {
  id: string
  userId: string
  plantId: string
  mediaUrl: string
  uploadedAt: number
  aiResult?: {
    pestDiseases?: string[]
    healthStatus?: string
    growthMetrics?: {
      leafCount?: number
      heightInCm?: number
    }
  }
}

export interface CreateMediaDto {
  plantId: string
  mediaUrl: string
} 