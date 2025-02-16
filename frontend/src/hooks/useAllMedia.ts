import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import type { Media } from './useUserMedia';

interface MediaFeedResponse {
  media: Media[];
  nextCursor?: string;
}

export function useAllMedia() {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery<MediaFeedResponse>({
    queryKey: ['allMedia'],
    queryFn: ({ pageParam = null }) => 
      api.get('/media/feed', { params: { cursor: pageParam } })
        .then(res => res.data),
    getNextPageParam: (lastPage: MediaFeedResponse) => lastPage.nextCursor,
    initialPageParam: null,
  });

  const media = data?.pages.flatMap(page => page.media) || [];

  return {
    media,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
  };
} 