import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/client';
import { MediaItem } from '../types/media';

export type Media = MediaItem;

export function useUserMedia(userId: string | undefined) {
  const { data: media = [], isLoading, error } = useQuery({
    queryKey: ['media', userId],
    queryFn: () => mediaApi.getUserMedia(),
    enabled: !!userId,
  });

  return { media, isLoading, error };
} 