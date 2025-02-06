import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { VideoMetadata } from '../types/video';

export function useUserVideos(userId: string | undefined) {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserVideos() {
      if (!userId) {
        setVideos([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get(`/videos/user/${userId}`);
        setVideos(response.data.videos);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user videos'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserVideos();
  }, [userId]);

  return {
    videos,
    isLoading,
    error,
  };
} 