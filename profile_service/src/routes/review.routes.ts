import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createReview,
  getMyReviews,
  getReviewsByBook,
} from "../controllers/review.controller";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/me", authenticate, getMyReviews);
router.get("/book/:id", getReviewsByBook);

export default router;
