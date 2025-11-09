import { Request, Response } from "express";
import { StarredBook } from "../models";

export const toggleStarredBook = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { bookId } = req.body;

    if (!bookId)
      return res
        .status(400)
        .json({ success: false, message: "Missing bookId" });

    const existing = await StarredBook.findOne({ where: { userId, bookId } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, message: "Book unstarred" });
    }

    const newStar = await StarredBook.create({ userId, bookId });
    return res.status(201).json({ success: true, data: newStar });
  } catch (err) {
    console.error("Failed to toggle star:", err);
    return res.status(500).json({ success: false, message: "Toggle failed" });
  }
};

export const getMyStarredBooks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const stars = await StarredBook.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 200,
    });
    return res.json({ success: true, data: stars });
  } catch (err) {
    console.error("Failed to fetch starred books:", err);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};
