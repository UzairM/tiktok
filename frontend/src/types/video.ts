export interface VideoMetadata {
  id: string;
  url: string;
  thumbnailUrl: string;
  username: string;
  description: string;
  likes: number;
  isLiked: boolean;
  userId: string;
  timestamp: string;
  duration?: number;
  views: number;
} 