import { Request, Response } from "express";
import { Book, Subject } from "../models";
import { col, fn, literal, Op } from "sequelize";
import { sequelize } from "../config";

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

    const searchRaw = (req.query.search ?? req.query.title) as
      | string
      | undefined;
    const search = searchRaw?.trim();

    const minSimilarity = req.query.minSim ? Number(req.query.minSim) : 0.25;

    const whereBase: any = {};
    if (authors.length > 0) {
      whereBase.author = { [Op.in]: authors };
    }

    const andClauses: any[] = [];
    let attributes: any = undefined;
    const order: any[] = [];

    if (search) {
      if (search.length < 3) {
        andClauses.push({ title: { [Op.iLike]: `%${search}%` } });
      } else {
        andClauses.push(
          literal(`"Book"."title" % ${sequelize.escape(search)}`)
        );

        if (!Number.isNaN(minSimilarity)) {
          andClauses.push(
            sequelize.where(fn("similarity", col("Book.title"), search), {
              [Op.gte]: minSimilarity,
            })
          );
        }

        const simExpr = fn("similarity", col("Book.title"), search);
        (attributes as any) ??= { include: [] };
        (attributes as any).include.push([simExpr, "similarity"]);

        order.push([literal(`"similarity"`), "DESC"]);
      }
    }

    if (order.length === 0) {
      order.push(["createdAt", "DESC"]);
    }

    const filterSubjectsInclude: any = {
      model: Subject,
      as: "subjects",
      attributes: [],
      through: { attributes: [] },
      required: false,
    };

    if (subjects.length > 0) {
      filterSubjectsInclude.where = { name: { [Op.in]: subjects } };
      filterSubjectsInclude.required = true;
    }

    const page = await Book.findAndCountAll({
      include: [filterSubjectsInclude],
      where:
        andClauses.length > 0
          ? { ...whereBase, [Op.and]: andClauses }
          : whereBase,
      limit,
      offset,
      distinct: true,
      subQuery: false,
      order,
      ...(attributes ? { attributes } : {}),
    });

    const ids = page.rows.map((b: any) => b.id);

    if (ids.length === 0) {
      return res.json({
        success: true,
        count: page.count,
        data: [],
        limit,
        offset,
      });
    }

    const fullRows = await Book.findAll({
      where: { id: { [Op.in]: ids } },
      include: [
        {
          model: Subject,
          as: "subjects",
          attributes: ["name"],
          through: { attributes: [] },
          required: false,
        },
      ],
      ...(attributes ? { attributes } : {}),
      order: [
        literal(`array_position(ARRAY[${ids.join(",")}]::int[], "Book"."id")`),
      ],
      subQuery: false,
    });

    return res.json({
      success: true,
      count: page.count,
      data: fullRows,
      limit,
      offset,
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

export const getBooksByIds = async (req: Request, res: Response) => {
  try {
    const idsParam = (req.query.ids as string | undefined) ?? "";

    const ids = idsParam
      .split(",")
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (ids.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const uniqueIds = Array.from(new Set(ids)).slice(0, 50);

    const books = await Book.findAll({
      where: { id: { [Op.in]: uniqueIds } },
      include: [
        {
          model: Subject,
          as: "subjects",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    const byId = new Map(books.map((b: any) => [Number(b.id), b]));
    const ordered = uniqueIds.map((id) => byId.get(id)).filter(Boolean);

    return res.json({
      success: true,
      count: ordered.length,
      data: ordered,
    });
  } catch (err) {
    console.error("Failed to fetch books by ids:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch books by ids",
    });
  }
};
