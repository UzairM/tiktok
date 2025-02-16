import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { api, mediaApi } from '../api/client';
import { MediaItem } from '../types/media';

interface UseMediaAnalysisProps {
  mediaId: string;
  onSuccess?: () => void;
}

export function useMediaAnalysis({ mediaId, onSuccess }: UseMediaAnalysisProps) {
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(false);
  const queryClient = useQueryClient();

  // Query to check if analysis is in progress
  const { data: media } = useQuery<MediaItem>({
    queryKey: ['media', mediaId],
    queryFn: () => mediaApi.getMediaById(mediaId),
    refetchInterval: (query) => {
      const data = query.state.data;
      // If we're loading analysis and don't have results yet, poll every 2 seconds
      if ((isLoadingHealth && !data?.aiResult?.healthAnalysis) || 
          (isLoadingGrowth && !data?.aiResult?.growthAnalysis)) {
        return 2000;
      }
      // Otherwise stop polling
      return false;
    },
  });

  async function analyzeHealth() {
    setIsLoadingHealth(true);
    try {
      await mediaApi.analyzeHealth(mediaId);
      // Start polling by invalidating the query
      await queryClient.invalidateQueries({ queryKey: ['media', mediaId] });
    } catch (error) {
      console.error('Error analyzing health:', error);
      setIsLoadingHealth(false); // Reset loading state on error
    }
  }

  async function analyzeGrowth() {
    setIsLoadingGrowth(true);
    try {
      await mediaApi.analyzeGrowth(mediaId);
      // Start polling by invalidating the query
      await queryClient.invalidateQueries({ queryKey: ['media', mediaId] });
    } catch (error) {
      console.error('Error analyzing growth:', error);
      setIsLoadingGrowth(false); // Reset loading state on error
    }
  }

  // Stop loading states when we get results
  if (isLoadingHealth && media?.aiResult?.healthAnalysis) {
    setIsLoadingHealth(false);
    onSuccess?.();
  }

  if (isLoadingGrowth && media?.aiResult?.growthAnalysis) {
    setIsLoadingGrowth(false);
    onSuccess?.();
  }

  return {
    isLoadingHealth,
    isLoadingGrowth,
    analyzeHealth,
    analyzeGrowth,
  };
} 