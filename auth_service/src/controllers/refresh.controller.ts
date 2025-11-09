import { RefreshToken } from "../models";
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const pushRefreshToken = async (
  userId: number,
  token: string,
  expiresAt: Date
): Promise<RefreshToken> => {
  const newToken = await RefreshToken.create({
    userId: userId,
    token: token,
    expiresAt: expiresAt,
  });

  if (!newToken) throw new Error("Failed to push refresh token record");
  return newToken;
};

export const refresh = async (req: Request, res: Response) => {
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
      return res.status(403).json({
        success: false,
        message: "Token is revoked",
      });

    if (stored.expiresAt && new Date(stored.expiresAt).getTime() <= Date.now())
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });

    const refreshSecret = process.env.JWT_SECRET_REFRESH;
    const accessSecret = process.env.JWT_SECRET;
    if (!refreshSecret || !accessSecret)
      return res
        .status(500)
        .json({ success: false, message: "Server misconfiguration" });

    const decoded = jwt.verify(token, refreshSecret) as string | JwtPayload;

    if (!decoded || typeof decoded === "string")
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });

    const userId = (decoded.sub as string) ?? (decoded.id as number | string);
    const email = decoded.email as string | undefined;

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token payload" });

    if (String(stored.userId) !== String(userId))
      return res
        .status(401)
        .json({ success: false, message: "Token-user mismatch" });

    const accessPayload = { sub: String(userId), ...(email ? { email } : {}) };
    const accessToken = jwt.sign(accessPayload, accessSecret, {
      expiresIn: "5m",
    });

    return res.status(200).json({
      success: true,
      token: accessToken,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: (error as Error).message,
    });
  }
};
