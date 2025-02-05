import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccount.json';

initializeApp({
  credential: cert(serviceAccount as any),
});

export const auth = getAuth();
export const db = getFirestore(); 