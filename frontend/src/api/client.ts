import axios, { InternalAxiosRequestConfig } from 'axios';
import { EXPO_PUBLIC_API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { authApi } from './auth';

const API_URL = EXPO_PUBLIC_API_URL;
console.log('API URL:', API_URL); // Should show http://10.0.2.2:3000

export const apiClient = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token && config.headers) {
        // Log the full token for debugging
        console.log('Full token being sent:', token);
        
        // Make sure we're sending a raw token without 'Bearer'
        const cleanToken = token.replace('Bearer ', '');
        config.headers.Authorization = `Bearer ${cleanToken}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Try to refresh token
        const token = await authApi.refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        await authApi.logout();
        throw refreshError;
      }
    }
    throw error;
  }
);
