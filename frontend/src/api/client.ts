import axios from 'axios';
import { auth } from '../config/firebase';

// Log the API URL configuration
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
console.log('API URL:', apiUrl);

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor for auth
api.interceptors.request.use(
  async config => {
    const url = [config.baseURL, config.url].filter(Boolean).join('');
    console.log('Making request to:', url);
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Auth token added for request');
      } else {
        console.log('No user logged in');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    console.log('Request headers:', config.headers);
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log('Response received:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', {
        url: error.config?.url,
        request: error.request
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    
    if (error.response?.status === 401) {
      console.log('Unauthorized request - user needs to login');
    }
    return Promise.reject(error);
  }
);

// API functions
export const mediaApi = {
  getUserMedia: () => api.get('/media/user').then(res => res.data),
  getPlantMedia: (plantId: string) => api.get(`/media/plant/${plantId}`).then(res => res.data)
};
