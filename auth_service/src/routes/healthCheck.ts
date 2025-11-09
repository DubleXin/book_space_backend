import { Router } from "express";
import { healthCheck, pingDB } from "../controllers";
const router = Router();

router.get("/", healthCheck);
router.get("/db", pingDB);

export default router;
