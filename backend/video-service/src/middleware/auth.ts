import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

/* eslint-disable @typescript-eslint/prefer-namespace-keyword, @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
      };
    }
  }
}

export async function validateAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
       res.status(401).json({ message: 'Unauthorized' });
       return
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      id: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Unauthorized' });
  }
} 