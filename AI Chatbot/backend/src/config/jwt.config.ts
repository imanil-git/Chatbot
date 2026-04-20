import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_ACCESS_SECRET) throw new Error("JWT_ACCESS_SECRET is required");
console.log("JWT FROM CONFIG:", process.env.JWT_ACCESS_SECRET);
if (!process.env.JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is required");

export const jwtConfig = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m"
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  }
};
