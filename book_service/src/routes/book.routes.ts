import { Router } from "express";
import { getAllBooks, getBookById, getBooksByIds } from "../controllers";

const router = Router();

router.get("/", getAllBooks);
router.get("/batch", getBooksByIds);
router.get("/:id", getBookById);

export default router;
