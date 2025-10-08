import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}