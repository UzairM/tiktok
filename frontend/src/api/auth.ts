import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiClient } from './client';
import type { LoginPayload, SignupPayload } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authApi = {
  login: async (payload: LoginPayload) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, payload.email, payload.password);
      const token = await userCredential.user.getIdToken();
      
      // Log token for debugging
      console.log('Token received after login:', token);
      
      // Store the raw token
      await AsyncStorage.setItem('auth_token', token);
      
      // Set token for API calls
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return {
        token,
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          username: userCredential.user.displayName!,
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  signup: async (payload: SignupPayload) => {
    const userCredential = await createUserWithEmailAndPassword(auth, payload.email, payload.password);
    const token = await userCredential.user.getIdToken();
    
    // Set token for API calls
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return {
      token,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email!,
        username: payload.username,
      }
    };
  },

  logout: async () => {
    await signOut(auth);
    // Clear token from API client
    delete apiClient.defaults.headers.common['Authorization'];
  },

  refreshToken: async () => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true); // Force refresh
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return token;
    }
    throw new Error('No user logged in');
  }
};
