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

  // console.log("Access Token = ", accessToken);
  // console.log("Refersh Token = ", refreshToken);
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

export const refresh = async (refreshToken: string) => {
  const isBlacklisted = await tokenService.isTokenBlacklisted(refreshToken);
  if (isBlacklisted) {
    throw new AppError("Token revoked", 401, "UNAUTHORIZED");
  }

  const payload = tokenService.verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError("User not found", 401, "UNAUTHORIZED");
  }

  // Blacklist the old refresh token immediately (rotation)
  await tokenService.blacklistToken(refreshToken);

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
    tokenService.verifyRefreshToken(refreshToken); // catch errors silently — already expired is fine
    await tokenService.blacklistToken(refreshToken);
  } catch (err) {
    // Ignore error
  }
};
