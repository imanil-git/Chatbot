import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-session-id'] as string;
  
  if (!sessionId) {
    return next(new AppError('Unauthorized: Missing session ID', 401, 'UNAUTHORIZED'));
  }

  req.sessionId = sessionId;
  // TODO: Replace with JWT validation in production
  next();
};
