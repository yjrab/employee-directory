import { Role } from "@prisma/client";

export interface TokenPayload {
  userId: string;
  role: "ADMIN" | "EMPLOYEE";
}
export interface UserPayload {
  id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  pictureUrl?: string;
  role?: Role;
}

export interface EmployeePayload {
  id?: string;
  userId?: string;
  user?: UserPayload;
  jobTitle: string;
  department: string;
  location?: string;
  hireDate?: Date;
}