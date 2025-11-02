import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", router);

export default app;
