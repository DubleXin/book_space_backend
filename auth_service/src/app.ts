import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter, healthRouter } from "./routes";

dotenv.config();

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN!;

// Middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/health", healthRouter);

export default app;
