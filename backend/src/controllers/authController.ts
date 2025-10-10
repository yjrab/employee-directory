import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, comparePasswords } from "../lib/bcrypt";
import { generateAccessToken, generateRefreshToken } from "../lib/jwt";
import { verifyRefreshToken } from "../lib/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, jobTitle, department, location, phone, pictureUrl } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await hashPassword(password);

    let userRole: "ADMIN" | "EMPLOYEE" = "EMPLOYEE";

    if (role && (role === "ADMIN" || role === "EMPLOYEE")) {
        userRole = role;
    }

    if (!jobTitle || !department) {
      return res.status(400).json({ message: "jobTitle and department are required" });
    }

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, role: userRole, phone: phone ?? null, pictureUrl: pictureUrl ?? null },
    });

    await prisma.employee.create({
      data: {
        user: { connect: { id: user.id } },
        jobTitle,
        department,
        location: location ?? null,
      },
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

    // Send refresh token as HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const employee = await prisma.employee.findUnique({ where: { userId: user.id }, select: { id: true } });

    // Send access token and user data in response
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        pictureUrl: user.pictureUrl,
        employeeId: employee?.id || null,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const payload = verifyRefreshToken(token);
    if (!payload) return res.status(403).json({ message: "Invalid token" });

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      role: payload.role,
    });

    // fetch user and employee id to restore session on client
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true },
    });
    const employee = await prisma.employee.findUnique({ where: { userId: payload.userId }, select: { id: true } });

    res.json({ accessToken: newAccessToken, user: user ? { ...user, employeeId: employee?.id || null } : null });
  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh-token",
  });
  res.json({ message: "Logged out" });
};
