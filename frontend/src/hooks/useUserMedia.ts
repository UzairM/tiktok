import { useQuery } from '@tanstack/react-query';
import { mediaApi } from '../api/client';

export interface Media {
  id: string;
  userId: string;
  plantId: string;
  mediaUrl: string;
  createdAt: string;
}

export function useUserMedia(userId: string | undefined) {
  const { data: media = [], isLoading, error } = useQuery({
    queryKey: ['media', userId],
    queryFn: () => mediaApi.getUserMedia(),
    enabled: !!userId,
  });

  return { media, isLoading, error };
} 