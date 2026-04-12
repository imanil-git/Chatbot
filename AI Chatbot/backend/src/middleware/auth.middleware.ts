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
      return next(new AppError('No token provided', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    const payload = tokenService.verifyAccessToken(token);

    const user = await User.findById(payload.userId);
    if (!user) {
      return next(new AppError('User not found', 401, 'UNAUTHORIZED'));
    }

    req.user = {
      id: user.id as string,
      username: user.username,
      email: user.email
    };

    next();
  } catch (err) {
    next(err);
  }
};
