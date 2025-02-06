import { Router, Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import type { FirebaseError } from 'firebase-admin/app';

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3),
  }),
});

router.post('/signup', validate(signupSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Check if user exists
    try {
      await auth.getUserByEmail(email);
      res.status(400).json({
        message: 'Email already in use',
        code: 'auth/email-already-exists',
        field: 'email',
      });
      return;
    } catch (error) {
      // User doesn't exist, continue with signup
      if ((error as FirebaseError).code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      username,
      createdAt: new Date().toISOString(),
      isPrivate: false,
      followers: 0,
      following: 0,
      posts: 0,
    });

    // Create custom token
    const token = await auth.createCustomToken(userRecord.uid);

    res.status(201).json({
      token,
      user: {
        id: userRecord.uid,
        email: userRecord.email,
        username: userRecord.displayName,
      },
    });
  } catch (error) {
    const fbError = error as FirebaseError;
    res.status(400).json({
      message: fbError.message,
      code: fbError.code,
      field: fbError.code === 'auth/email-already-in-use' ? 'email' : undefined,
    });
  }
});

router.post('/login', validate(loginSchema), async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    const userRecord = await auth.getUserByEmail(email);
    const userData = await db.collection('users').doc(userRecord.uid).get();
    const userDataObj = userData.data();
    
    if (!userDataObj) {
      throw new Error('User data not found');
    }

    const token = await auth.createCustomToken(userRecord.uid);

    res.status(200).json({
      token,
      user: {
        id: userRecord.uid,
        email: userRecord.email || '',
        username: userDataObj.username,
        isPrivate: userDataObj.isPrivate,
        stats: {
          followers: userDataObj.followers,
          following: userDataObj.following,
          posts: userDataObj.posts,
        },
      },
    });
  } catch (error) {
    const fbError = error as FirebaseError;
    if (fbError.code === 'auth/wrong-password' || fbError.code === 'auth/user-not-found') {
      res.status(401).json({
        message: 'Invalid email or password',
        code: 'auth/invalid-credentials',
      });
      return;
    }
    res.status(500).json({
      message: 'Server error',
      code: fbError.code,
    });
  }
});

router.post('/logout', async (_req, res) => {
  // Simple success response - actual logout happens on frontend
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router; 