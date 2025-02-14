import { initializeApp, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'serviceAccount.json'), 'utf8')
);

// Initialize Firebase Admin
try {
  getApp();
} catch {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

// Get Firestore instance
export const db = getFirestore();
export const auth = getAuth(); 