import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { VideoMetadata } from '../types/video';

export function useVideo(videoId: string) {
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      try {
        const response = await apiClient.get(`/videos/${videoId}`);
        setVideo(response.data.video);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch video'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  return {
    video,
    isLoading,
    error,
  };
} 