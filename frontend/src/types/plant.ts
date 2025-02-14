export interface Plant {
  id: string
  userId: string
  name: string
  type: string
  createdAt: number
}

export interface CreatePlantDto {
  name: string
  type: string
} 