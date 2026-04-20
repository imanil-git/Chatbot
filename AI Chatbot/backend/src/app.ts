import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import chatRoutes from "./routes/chat.routes";
import authRoutes from "./routes/auth.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
