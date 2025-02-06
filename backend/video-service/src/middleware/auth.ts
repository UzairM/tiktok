import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
        code: 'auth/no-token',
        message: 'No token provided'
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Received token:', token); // Debug log
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
        res.status(401).json({
        code: 'auth/invalid-token',
        message: 'Invalid token'
      });
      return;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
      res.status(500).json({
      code: 'auth/server-error',
      message: 'Internal server error'
    });
    return;
  }
}; 