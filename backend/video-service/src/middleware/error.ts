import { Request, Response, NextFunction } from 'express';
import type { FirebaseError } from 'firebase-admin/app';

function isFirebaseError(error: unknown): error is FirebaseError {
  return (error as FirebaseError)?.code !== undefined;
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  if (isFirebaseError(error)) {
    res.status(400).json({
      message: error.message,
      code: error.code,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
    code: 'server/internal-error',
  });
  return;
} 