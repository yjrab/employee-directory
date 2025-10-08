import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/bcrypt";

// GET /api/employees
export async function listEmployees(req: Request, res: Response) {
  const { page = 1, limit = 20, search, department, title, location } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  if (department) where.department = department;
  if (title) where.jobTitle = title;
  if (location) where.location = location;

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { jobTitle: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [total, data] = await Promise.all([
      prisma.employee.count({ where }),
      prisma.employee.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true } } },
      }),
    ]);

    return res.json({
      meta: { total, page, limit, pages: Math.ceil(total / Number(limit)) },
      data,
    });
  } catch (err) {
    console.error("listEmployees error:", err);
    return res.status(500).json({ error: "Failed to list employees" });
  }
}

// GET /api/employees/:id
export async function getEmployee(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true } } },
    });

    if (!employee) return res.status(404).json({ error: "Employee not found" });
    return res.json(employee);
  } catch (err) {
    console.error("getEmployee error:", err);
    return res.status(500).json({ error: "Failed to get employee" });
  }
}

// POST /api/employees
export async function createEmployee(req: Request, res: Response) {
  const payload = req.body;

  // build prisma data object safely
  const data: any = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone ?? null,
    pictureUrl: payload.pictureUrl ?? null,
    jobTitle: payload.jobTitle,
    department: payload.department,
    location: payload.location ?? null,
    hireDate: payload.hireDate ?? undefined,
  };

  try {
    if (payload.userId) {
      // connect to existing user by id
      data.user = { connect: { id: payload.userId } };
    } else if (payload.user) {
      // nested create user
      const nested = { ...payload.user };
      if (nested.password) {
        nested.password = await hashPassword(nested.password);
      } else {
        delete nested.password;
      }

      data.user = {
        create: {
          email: nested.email,
          firstName: nested.firstName ?? payload.firstName,
          lastName: nested.lastName ?? payload.lastName,
          ...(nested.password ? { password: nested.password } : {}),
          role: nested.role ?? "EMPLOYEE",
        },
      };
    }

    const employee = await prisma.employee.create({
      data,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
    });

    return res.status(201).json(employee);
  } catch (err: any) {
    console.error("createEmployee error:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Record already exists", meta: err.meta });
    }
    return res.status(500).json({ error: "Failed to create employee" });
  }
}

// PUT /api/employees/:id
export async function updateEmployee(req: Request, res: Response) {
    const { id } = req.params;
    const payload = req.body;

  // Prevent updates to protected fields if present in body
  const forbidden = ["id", "createdAt", "updatedAt", "userId"];
  for (const key of forbidden) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      return res.status(400).json({ error: `Updating field "${key}" is not allowed` });
    }
  }

  // Do not allow password updates through this endpoint
  if ((payload as any).user?.password) {
    return res.status(400).json({ error: "Password updates are not allowed through this endpoint" });
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(payload.firstName !== undefined ? { firstName: payload.firstName } : {}),
        ...(payload.lastName !== undefined ? { lastName: payload.lastName } : {}),
        ...(payload.email !== undefined ? { email: payload.email } : {}),
        ...(payload.phone !== undefined ? { phone: payload.phone } : {}),
        ...(payload.pictureUrl !== undefined ? { pictureUrl: payload.pictureUrl } : {}),
        ...(payload.jobTitle !== undefined ? { jobTitle: payload.jobTitle } : {}),
        ...(payload.department !== undefined ? { department: payload.department } : {}),
        ...(payload.location !== undefined ? { location: payload.location } : {}),
        ...(payload.hireDate !== undefined ? { hireDate: payload.hireDate } : {}),
      },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true } } },
    });

    return res.json(employee);
  } catch (err: any) {
    console.error("updateEmployee error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Employee not found" });
    }
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Unique constraint violation", meta: err.meta });
    }
    return res.status(500).json({ error: "Failed to update employee" });
  }
}

// DELETE /api/employees/:id
export async function deleteEmployee(req: Request, res: Response) {
  const { id } = req.params;

  try {
    await prisma.employee.delete({ where: { id } });
    return res.status(204).send();
  } catch (err: any) {
    console.error("deleteEmployee error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.status(500).json({ error: "Failed to delete employee" });
  }
}
