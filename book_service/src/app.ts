import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { healthRouter } from "./routes";
import { bookRouter } from "./routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/health", healthRouter);
app.use("/api/book", bookRouter);

export default app;
