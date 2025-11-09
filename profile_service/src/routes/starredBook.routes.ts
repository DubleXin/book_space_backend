import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  toggleStarredBook,
  getMyStarredBooks,
} from "../controllers/starredBook.controller";

const router = Router();

router.post("/", authenticate, toggleStarredBook);
router.get("/me", authenticate, getMyStarredBooks);

export default router;
