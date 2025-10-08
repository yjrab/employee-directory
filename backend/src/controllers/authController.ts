import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePasswords } from "../lib/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);

    let userRole: "ADMIN" | "EMPLOYEE" = "EMPLOYEE";

    if (role && (role === "ADMIN" || role === "EMPLOYEE")) {
        userRole = role;
    }

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, role: userRole },
    });

    res.status(201).json({ message: "User created", userId: user.id });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    res.json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const refreshToken = (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = generateAccessToken({ userId: token.userId, role: token.role });
    res.json({ accessToken: payload });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};
