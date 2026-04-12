import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import { TokenBlacklist } from '../models/TokenBlacklist.model';
import { AppError } from '../middleware/error.middleware';

export interface AccessTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}

export const signAccessToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn as jwt.SignOptions['expiresIn']
  });
};

export const signRefreshToken = (payload: { userId: string }): string => {
  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn as jwt.SignOptions['expiresIn']
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.access.secret) as AccessTokenPayload;
  } catch (err) {
    throw new AppError("Invalid or expired access token", 401, "UNAUTHORIZED");
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, jwtConfig.refresh.secret) as RefreshTokenPayload;
  } catch (err) {
    throw new AppError("Invalid or expired refresh token", 401, "UNAUTHORIZED");
  }
};

export const decodeExpiry = (token: string): Date => {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  if (!decoded || !decoded.exp) {
    throw new Error('Invalid token: missing exp claims');
  }
  return new Date(decoded.exp * 1000);
};

export const blacklistToken = async (token: string): Promise<void> => {
  const expiresAt = decodeExpiry(token);
  await TokenBlacklist.add(token, expiresAt);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  return TokenBlacklist.isBlacklisted(token);
};
