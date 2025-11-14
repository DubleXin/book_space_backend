import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  getUserRecommendations,
  getEnhancedRecommendations,
} from "../controllers";

const router = Router();

router.get("/algorithmic", authenticate, getUserRecommendations);
router.get("/", authenticate, getEnhancedRecommendations);

export default router;
