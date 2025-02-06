import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { VideoMetadata } from '../types/video';

export function useVideos() {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = async (cursor?: string) => {
    try {
      const response = await apiClient.get('/videos/feed', {
        params: cursor ? { cursor } : undefined
      });

      const { videos: newVideos, nextCursor: newCursor } = response.data;

      if (!cursor) {
        setVideos(newVideos);
      } else {
        setVideos(prev => [...prev, ...newVideos]);
      }

      setNextCursor(newCursor || undefined);
      setHasMore(!!newCursor);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch videos'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasMore || isLoading) return;
    await fetchVideos(nextCursor);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    isLoading,
    error,
    fetchNextPage,
    hasMore,
  };
} 