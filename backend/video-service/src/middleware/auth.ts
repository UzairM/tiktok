import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        message: 'No token provided',
        code: 'auth/no-token',
      });
      return;
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
      };
      next();
    } catch (error) {
      // Token verification failed but we still want to allow logout
      if (req.path === '/auth/logout') {
        next();
        return;
      }
      throw error;
    }
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token',
      code: 'auth/invalid-token',
    });
  }
} 