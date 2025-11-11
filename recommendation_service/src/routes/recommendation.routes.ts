import { Router } from "express";
import { authenticate } from "../middlewares";
import { getUserRecommendations } from "../controllers";

const router = Router();

router.get("/", authenticate, getUserRecommendations);

export default router;
