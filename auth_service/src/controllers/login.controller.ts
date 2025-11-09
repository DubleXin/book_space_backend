import { Request, Response } from "express";
import { User } from "../models";
import jwt from "jsonwebtoken";
import { pushRefreshToken } from "./refresh.controller";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user)
      return res.status(404).json({
        success: false,
      });

    const correctCredentials = await user.validatePassword(password);

    if (!correctCredentials)
      return res.status(409).json({
        success: false,
      });
    if (!process.env.JWT_SECRET || !process.env.JWT_SECRET_REFRESH)
      throw new Error("Failed to parse JWT token secrets");
    const tokenUser = {
      sub: user.id,
      email: user.email,
    };
    const token = jwt.sign(tokenUser, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });
    const refreshToken = jwt.sign(tokenUser, process.env.JWT_SECRET_REFRESH, {
      expiresIn: "10d",
    });

    const decoded = jwt.decode(refreshToken) as { exp?: number };
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : null;

    if (!expiresAt)
      return res.status(500).json({
        success: false,
        error: "Failed to process expiration of token",
      });

    await pushRefreshToken(user.id, refreshToken, expiresAt);

    return res.status(200).json({ success: true, token, refreshToken });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: (e as Error).message,
    });
  }
};
