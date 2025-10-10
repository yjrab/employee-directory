import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload } from "../types/auth";
import { prisma } from "../lib/prisma";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      return res.status(500).json({ message: "Server configuration error" });
    }
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });
  next();
};

export const requireSelfEmployeeOrAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role === "ADMIN") return next();

    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Invalid employee id" });
    const emp = await prisma.employee.findUnique({ where: { id }, select: { userId: true } });
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    if (emp.userId !== req.user.userId) return res.status(403).json({ message: "Forbidden" });
    return next();
  } catch (e) {
    return res.status(500).json({ message: "Authorization check failed" });
  }
};
