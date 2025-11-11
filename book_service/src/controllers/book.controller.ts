import { Request, Response } from "express";
import { Book, Subject } from "../models";
export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const subjectParam = req.query.subject as string | undefined;
    const subjects =
      subjectParam
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    const authorParam = req.query.author as string | undefined;
    const authors =
      authorParam
        ?.split(",")
        .map((a) => a.trim())
        .filter(Boolean) || [];

    const options: any = {
      include: [
        {
          model: Subject,
          as: "subjects",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      where: {},
      limit,
      offset,
    };

    if (subjects.length > 0) {
      options.include[0].where = { name: subjects };
    }

    if (authors.length > 0) {
      options.where.author = authors;
    }

    const books = await Book.findAll(options);

    return res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (err) {
    console.error("Failed to fetch books:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch books",
    });
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id, {
      include: [
        {
          model: Subject,
          as: "subjects",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });
    if (!book)
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    return res.json({ success: true, data: book });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch book" });
  }
};
