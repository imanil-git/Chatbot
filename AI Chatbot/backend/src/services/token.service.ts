import jwt from 'jsonwebtoken';
import crypto from 'crypto'; // Node's built-in module for unique IDs
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
  jti: string; // JWT ID: The unique ID for this specific token. Crucial for blacklisting individual tokens.
}

export const signAccessToken = (payload: { userId: string; email: string }): string => {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn as jwt.SignOptions['expiresIn']
  });
};

export const signRefreshToken = (payload: { userId: string }): string => {
  // Generate a random unique identifier for this refresh token
  // This is called a "jti" (JWT ID) claim. 
  const jti = crypto.randomUUID();

  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn as jwt.SignOptions['expiresIn'],
    jwtid: jti // This automatically injects 'jti' into the payload
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

// --- Blacklist Logic ---

export const blacklistToken = async (token: string): Promise<void> => {
  // We decode (not verify) just to safely pull out the JTI and expiry
  // Decoding is fine here because we just need the metadata. If it was manipulated,
  // it either fails signature verification elsewhere or simply blacklists a fake JTI (harmless).
  const decoded = jwt.decode(token) as RefreshTokenPayload | null;
  if (!decoded || !decoded.exp || !decoded.jti) {
    throw new Error('Invalid token: missing claims');
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const jti = decoded.jti;

  // Save ONLY the unique tiny ID to the database instead of the huge token string
  // This makes MongoDB lookups incredibly fast.
  await TokenBlacklist.add(jti, expiresAt);
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const decoded = jwt.decode(token) as RefreshTokenPayload | null;
  if (!decoded || !decoded.jti) return false;
  
  // Look up exactly this JTI in the database
  return TokenBlacklist.isBlacklisted(decoded.jti);
};
