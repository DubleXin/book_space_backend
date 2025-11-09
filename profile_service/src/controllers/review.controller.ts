import { Request, Response } from "express";
import { Review } from "../models";

export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookId, message, rating } = req.body;

    if (!bookId || !message)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const review = await Review.create({ userId, bookId, message, rating });
    return res.status(201).json({ success: true, data: review });
  } catch (err) {
    console.error("Failed to create review:", err);
    return res.status(500).json({ success: false, message: "Creation failed" });
  }
};

export const getMyReviews = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const reviews = await Review.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error("Failed to fetch reviews:", err);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

export const getReviewsByBook = async (req: Request, res: Response) => {
  try {
    const { id: bookId } = req.params;
    const reviews = await Review.findAll({ where: { bookId } });
    return res.json({ success: true, data: reviews });
  } catch (err) {
    console.error("Failed to fetch book reviews:", err);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};
