import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import * as tokenService from '../services/token.service';
import { User } from '../models/User.model';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("[AUTH][API] 🔴 Request denied: No valid authorization header");
      return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      console.log("[AUTH][API] 🔴 Request denied: User not found in DB");
      return next(new AppError('User not found', 401, 'UNAUTHORIZED'));
    }

    console.log(`[AUTH][API] 🟢 Access granted. User: ${user.email} | Route: ${req.originalUrl}`);
    
    // Attach the user to the request so controllers can easily access `req.user`
    req.user = {
      id: user.id as string,
      username: user.username,
      email: user.email
    };

    next();
  } catch (err) {
    console.log(`[AUTH][API] 🔴 Request denied for ${req.originalUrl}: Invalid or expired token`);
    next(err);
  }
};
