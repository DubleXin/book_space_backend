import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { RefreshToken } from "../models";

export const logout = async (req: Request, res: Response) => {
  const { token } = req.body ?? {};
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Missing refresh token" });
  try {
    const stored = await RefreshToken.findOne({
      where: {
        token: token,
      },
    });
    if (!stored)
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });

    if (stored.revoked)
      return res.status(200).json({
        success: true,
        message: "Token is already revoked",
      });

    const refreshSecret = process.env.JWT_SECRET_REFRESH;
    if (!refreshSecret)
      return res
        .status(500)
        .json({ success: false, message: "Server misconfiguration" });

    const decoded = jwt.verify(token, refreshSecret) as string | JwtPayload;
    if (!decoded || typeof decoded === "string")
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });

    const userId = (decoded.sub as string) ?? (decoded.id as number | string);
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });
    if (String(stored.userId) !== String(userId))
      return res
        .status(401)
        .json({ success: false, message: "Token-user mismatch" });

    const updated = await stored.update({
      revoked: true,
    });
    if (!updated.revoked)
      return res.status(500).json({
        success: false,
        message: "Failed to revoke token",
      });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: (error as Error).message,
    });
  }
};
