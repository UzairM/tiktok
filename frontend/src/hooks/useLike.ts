import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export function useLike() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const toggleLike = async (videoId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/videos/${videoId}/like`);
      return response.data.isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    toggleLike,
    isLoading,
  };
} 