import { Request, Response } from "express";

export const getBook = (req: Request, res: Response) => {
  const { user } = req as any;
  console.debug(req);
  if (!user)
    return res.status(401).json({
      error: "Unauthorized",
    });
  console.debug(user);
  return res.status(200).json({
    user: user,
  });
};
