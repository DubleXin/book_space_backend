import { Request, Response } from "express";
import { sequelize } from "../config";
import { QueryTypes } from "sequelize";

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({ message: "up and running" });
};

export const pingDB = async (req: Request, res: Response) => {
  try {
    const [result] = await sequelize.query<{ now: string }>("SELECT NOW()", {
      type: QueryTypes.SELECT,
    });
    res.status(200).json({
      success: true,
      message: "DB connection healthy",
      timestamp: result.now,
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "DB health check failed.",
      error: (error as Error).message,
    });
  }
};
