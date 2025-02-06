import axios, { AxiosProgressEvent } from 'axios';
import { apiClient } from './client';

export interface VideoFile {
  uri: string;
  type: string;
  name: string;
}

export async function uploadVideo(
  video: VideoFile,
  onProgress?: (progress: number) => void
): Promise<{ id: string; url: string }> {
  try {
    const formData = new FormData();
    formData.append('video', {
      uri: video.uri,
      type: video.type,
      name: video.name,
    } as any);

    console.log('Uploading to:', apiClient.defaults.baseURL); // Debug log

    const response = await apiClient.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(progress);
        }
      },
      // Add timeout and max content length
      timeout: 30000, // 30 seconds
      maxContentLength: Infinity,
    });

    return response.data;
  } catch (error) {
    console.error('Upload error details:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
} 