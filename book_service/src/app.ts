import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthRouter, subjectRouter } from "./routes";
import { bookRouter } from "./routes";

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
app.use("/health", healthRouter);
app.use("/api/book", bookRouter);
app.use("/api/subject", subjectRouter);

export default app;
