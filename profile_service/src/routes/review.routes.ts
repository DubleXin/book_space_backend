import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  createReview,
  deleteReview,
  getMyReviews,
  getReviewsByBook,
  getReviewsByUserId,
} from "../controllers/review.controller";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/me", authenticate, getMyReviews);
router.get("/book/:id", getReviewsByBook);
router.get("/:userId", getReviewsByUserId);
router.delete("/:reviewId", authenticate, deleteReview);

export default router;
