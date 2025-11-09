import { Router } from "express";
import { getAllSubjects, getBooksBySubject } from "../controllers";

const router = Router();

router.get("/", getAllSubjects);
router.get("/:id", getBooksBySubject);

export default router;
