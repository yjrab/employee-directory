import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types/auth";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "accesstokensecret") as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
