import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    const data = await authService.register(username, email, password);
    
    console.log(`[AUTH][REGISTER] Success! Setting HTTP-only refresh cookie for: ${email}`);
    
    // 1. Send the refresh token in an HTTP-only cookie
    // Security: httpOnly ensures JavaScript cannot access this token. This protects from XSS attacks!
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
    });


    // 2. SECURITY FIX: Strip refreshToken from the JSON response to prevent XSS theft!
    const { refreshToken, ...safeData } = data;
    
    res.status(201).json({ success: true, data: safeData });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    
    console.log(`[AUTH][LOGIN] Success! Setting HTTP-only refresh cookie for: ${email}`);

    // 1. Send the refresh token in an HTTP-only cookie
    // Security: By storing this in a cookie that JS cannot read, we mitigate XSS token theft!
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true, // Crucial: JS cannot read this!
      secure: process.env.NODE_ENV === "production", // Must be true in production (HTTPS)
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
    });
    
    // SECURITY FIX: Strip refreshToken from the JSON response
    const { refreshToken, ...safeData } = data;

    res.status(200).json({ success: true, data: safeData });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // SECURITY FIX: ONLY accept refresh tokens from the httpOnly cookie, NOT req.body
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided in cookies" }); 
    }
    
    const data = await authService.refresh(refreshToken);
    
    console.log("[AUTH][REFRESH] Rotating tokens and setting new HTTP-only refresh cookie");
    
    // Set the NEW rotated refresh token in the cookie
    res.cookie("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    // SECURITY FIX: Strip refreshToken from the JSON response
    const { refreshToken: _, ...safeData } = data;
    res.status(200).json({ success: true, data: safeData });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("[AUTH][LOGOUT] User requesting logout. Clearing cookies...");
    // SECURITY FIX: ONLY accept refresh tokens from the httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    // Ensure we clear the cookie with the EXACT same path and security settings use to set it
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(200).json({ success: true, data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};
