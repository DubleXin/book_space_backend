import { Request, Response } from "express";

export const register = (req: Request, res: Response) => {
  res.json({ message: "User registered" });
};

export const login = (req: Request, res: Response) => {
  res.json({ message: "User logged in with success" });
};
