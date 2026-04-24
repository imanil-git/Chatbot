import { User } from "../models/User.model";
import * as tokenService from "./token.service";
import { AppError } from "../middleware/error.middleware";

export const register = async (
  username: string,
  email: string,
  passwordHash: string,
) => {
  const existingEmail = await User.findByEmail(email);
  if (existingEmail) {
    throw new AppError("Email already registered", 409, "CONFLICT");
  }

  const existingUsername = await User.findByUsername(username);
  if (existingUsername) {
    throw new AppError("Username taken", 409, "CONFLICT");
  }

  const user = await User.create({ username, email, passwordHash });

  const accessToken = tokenService.signAccessToken({
    userId: user.id as string,
    email: user.email,
  });
  const refreshToken = tokenService.signRefreshToken({
    userId: user.id as string,
  });

  return {
    user: { id: user.id, username: user.username, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const login = async (email: string, plain: string) => {
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");
  }

  const isValid = await user.comparePassword(plain);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401, "UNAUTHORIZED");
  }

  console.log(`[AUTH][LOGIN] Success! Generating tokens for: ${email}`);

  // Create both tokens: 
  // Access Token (short-lived) for API access, Refresh Token (long-lived) for getting new Access Tokens
  const accessToken = tokenService.signAccessToken({
    userId: user.id as string,
    email: user.email,
  });
  const refreshToken = tokenService.signRefreshToken({
    userId: user.id as string,
  });

  // Return to controller (where refreshToken shouldn't be exposed to the client body!)
  return {
    user: { id: user.id, username: user.username, email: user.email },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  console.log("[AUTH][REFRESH] Checking blacklist...");
  
  // 1. Ensure the token's JTI hasn't been logged out or previously rotated
  // We check the database to see if this specific token ID was revoked.
  // This is how we enforce logouts or block stolen tokens.
  const isBlacklisted = await tokenService.isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    console.log("[AUTH][REFRESH] 🔴 Token is blacklisted! Denying access (possible token reuse/theft).");
    throw new AppError("Token revoked", 401, "UNAUTHORIZED");
  }

  // 2. Verify signature and get userId (will throw if expired or invalid signature)
  const payload = tokenService.verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError("User not found", 401, "UNAUTHORIZED");
  }

  console.log("[AUTH][REFRESH] 🟢 Valid! Rotating tokens...");

  // 3. Blacklist the old refresh token IMMEDIATELY (Token Rotation)
  // This prevents it from being used again. If an attacker stole this token, 
  // they can't use it anymore because we generate a completely new token ID (jti) for the user now.
  await tokenService.blacklistToken(refreshToken);

  // 4. Issue fresh tokens
  const newAccessToken = tokenService.signAccessToken({
    userId: user.id as string,
    email: user.email,
  });
  const newRefreshToken = tokenService.signRefreshToken({
    userId: user.id as string,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken: string) => {
  try {
    console.log("[AUTH][LOGOUT] Adding refresh token JTI to blacklist...");
    tokenService.verifyRefreshToken(refreshToken); // catch errors silently — already expired is fine
    await tokenService.blacklistToken(refreshToken);
  } catch (err) {
    // Ignore error, if it's expired we dont care
  }
};
