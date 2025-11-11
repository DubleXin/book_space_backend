import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  toggleStarredBook,
  getMyStarredBooks,
  getStarredBooksByUserId,
} from "../controllers/starredBook.controller";

const router = Router();

router.post("/", authenticate, toggleStarredBook);
router.get("/me", authenticate, getMyStarredBooks);
router.get("/:userId", getStarredBooksByUserId);

export default router;
