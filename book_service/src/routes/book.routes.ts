import { Router } from "express";
import { getBook } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.get("/", authenticate, getBook);

export default router;
