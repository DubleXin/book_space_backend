import { Request, Response } from "express";
import { StarredBook } from "../models";
import axios from "axios";

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || "http://api-book:4000";

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

export const getStarredBooksByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({
        success: false,
        message: "Missing userId param",
      });
    const starred = await StarredBook.findAll({ where: { userId } });

    if (!starred.length)
      return res
        .status(404)
        .json({ success: false, message: "No starred books found" });

    const enriched = await Promise.all(
      starred.map(async (s) => {
        try {
          const { data } = await axios.get(
            `${BOOK_SERVICE_URL}/api/book/${s.bookId}`
          );

          return { ...s.toJSON(), book: data.data };
        } catch {
          return { ...s.toJSON(), book: null };
        }
      })
    );

    return res.json({ success: true, data: enriched });
  } catch (err) {
    console.error("Failed to fetch starred books by user:", err);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};
