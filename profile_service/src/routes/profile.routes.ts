import { Router } from "express";
import { authenticate } from "../middlewares";
import {
  getMyProfile,
  getProfileByUserId,
  updateMyProfile,
} from "../controllers/profile.controller";

const router = Router();
router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);
router.get("/:id", getProfileByUserId);

export default router;
