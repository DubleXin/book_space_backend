import { Request, Response } from "express";
import { Subject, Book } from "../models";

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    res.json({ success: true, data: subjects });
  } catch (err) {
    console.error("Failed to fetch subjects:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch subjects" });
  }
};

export const getBooksBySubject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const subject = await Subject.findByPk(id);
    if (!subject)
      return res
        .status(404)
        .json({ success: false, message: "Subject not found" });

    const books = await Book.findAll({
      include: [
        {
          model: Subject,
          as: "subjects",
          where: { id },
          attributes: [],
          through: { attributes: [] },
        },
      ],
      attributes: ["id", "title", "author", "coverUrl"],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        subject: subject.name,
        books,
        pagination: { limit, offset, count: books.length },
      },
    });
  } catch (err) {
    console.error("Failed to fetch books by subject:", err);
    res.status(500).json({ success: false, message: "Failed to fetch books" });
  }
};
