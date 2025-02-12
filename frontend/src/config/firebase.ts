import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBZ16SQNUWSLC3vpHip8t546x4G56nZtzE",
  authDomain: "tiktok-8887c.firebaseapp.com",
  projectId: "tiktok-8887c",
  storageBucket: "tiktok-8887c.appspot.com",
  messagingSenderId: "751239168416",
  appId: "1:751239168416:web:9fa73920d0c078eb7ae4c5"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
}); 