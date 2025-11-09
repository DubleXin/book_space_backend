import { Request, Response } from "express";
import { Book, Subject } from "../models";

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const subject = req.query.subject as string | undefined;

    const options: any = {
      include: [
        {
          model: Subject,
          as: "subjects",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
    };

    if (subject) {
      options.include[0].where = { name: subject };
    }

    const books = await Book.findAll(options);
    return res.json({ success: true, data: books });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch books" });
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
