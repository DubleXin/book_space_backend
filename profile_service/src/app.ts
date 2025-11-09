import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthRouter } from "./routes";
import { profileRouter, reviewRouter, starredRouter } from "./routes";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/profile", profileRouter);
app.use("/api/review", reviewRouter);
app.use("/api/star", starredRouter);

export default app;
