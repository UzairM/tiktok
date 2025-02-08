import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { apiClient } from './client';
import type { LoginPayload, SignupPayload } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  },

  updateProfileImage: async (imageUri: string) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      console.log('Starting profile image update for user:', user.uid);
      console.log('Image URI:', imageUri);

      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      console.log('Image converted to blob, size:', blob.size);

      // Upload to Firebase Storage
      const storage = getStorage();
      const imageRef = ref(storage, `profile-images/${user.uid}`);
      console.log('Uploading to Firebase Storage:', imageRef.fullPath);
      
      await uploadBytes(imageRef, blob);
      console.log('Upload complete, getting download URL');

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      console.log('Download URL:', downloadURL);

      // Update user profile
      await updateProfile(user, {
        photoURL: downloadURL,
      });
      console.log('User profile updated with new photo URL');

      return downloadURL;
    } catch (error) {
      console.error('Profile image update error:', error);
      throw error;
    }
  }
};
