export interface MediaItem {
  id: string
  userId: string
  plantId: string
  mediaUrl: string
  uploadedAt: number
  type: 'image' | 'video'
  aiResult?: {
    healthAnalysis?: string
    growthAnalysis?: string
  }
}

export interface CreateMediaDto {
  plantId: string
  mediaUrl: string
  type: 'image' | 'video'
  aiResult?: MediaItem['aiResult']
} 