import { Request, Response } from "express";
import { User } from "../models";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(409).json({
        success: false,
      });

    const newUser = await User.create({ email, password });

    if (!newUser) throw new Error("USer creation failed");

    return res.status(201).json({
      success: true,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: (e as Error).message,
    });
  }
};
