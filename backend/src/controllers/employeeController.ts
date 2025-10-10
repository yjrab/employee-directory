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
    const q = String(search);
    where.OR = [
      { jobTitle: { contains: q, mode: "insensitive" } },
      { department: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
      { user: { firstName: { contains: q, mode: "insensitive" } } },
      { user: { lastName: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { user: { phone: { contains: q, mode: "insensitive" } } },
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
        include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true, phone: true } } },
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
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true, phone: true } } },
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

  const data: any = {
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
      // nested create user using provided user payload
      const nested = { ...payload.user } as any;
      const hashed = await hashPassword(nested.password || "changeme");
      data.user = {
        create: {
          email: nested.email,
          firstName: nested.firstName ?? payload.firstName,
          lastName: nested.lastName ?? payload.lastName,
          password: hashed,
          role: nested.role ?? "EMPLOYEE",
          phone: nested.phone ?? payload.phone ?? null,
          pictureUrl: nested.pictureUrl ?? payload.pictureUrl ?? null,
        },
      };
    } else if (payload.email || payload.firstName || payload.lastName) {
      const hashed = await hashPassword("changeme");
      data.user = {
        create: {
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          password: hashed,
          role: "EMPLOYEE",
          phone: payload.phone ?? null,
          pictureUrl: payload.pictureUrl ?? null,
        },
      };
    }

    const employee = await prisma.employee.create({
      data,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true, phone: true } } },
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

  if ((payload as any).user?.password) {
    return res.status(400).json({ error: "Password updates are not allowed through this endpoint" });
  }

  try {
    // Build the update data for the employee
    const employeeData: any = {};
    if (payload.jobTitle !== undefined) employeeData.jobTitle = payload.jobTitle;
    if (payload.department !== undefined) employeeData.department = payload.department;
    if (payload.location !== undefined) employeeData.location = payload.location;
    if (payload.hireDate !== undefined) employeeData.hireDate = payload.hireDate;

    // Handle user data updates through the relation
    if (payload.firstName !== undefined || payload.lastName !== undefined ||
        payload.email !== undefined || payload.phone !== undefined || payload.pictureUrl !== undefined) {

      const currentEmployee = await prisma.employee.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!currentEmployee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      const userUpdateData: any = {};
      if (payload.firstName !== undefined) userUpdateData.firstName = payload.firstName;
      if (payload.lastName !== undefined) userUpdateData.lastName = payload.lastName;
      if (payload.email !== undefined) userUpdateData.email = payload.email;
      if (payload.phone !== undefined) userUpdateData.phone = payload.phone;
      if (payload.pictureUrl !== undefined) userUpdateData.pictureUrl = payload.pictureUrl;

      await prisma.user.update({
        where: { id: currentEmployee.userId },
        data: userUpdateData
      });

      if (Object.keys(employeeData).length > 0) {
        await prisma.employee.update({
          where: { id },
          data: employeeData
        });
      }
    } else if (Object.keys(employeeData).length > 0) {
      await prisma.employee.update({
        where: { id },
        data: employeeData
      });
    }

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true, role: true, pictureUrl: true, phone: true } } },
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
    const employee = await prisma.employee.findUnique({ where: { id }, select: { userId: true } });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Delete the user, Employee will cascade-delete due to onDelete: Cascade on relation
    await prisma.user.delete({ where: { id: employee.userId } });
    return res.status(204).send();
  } catch (err: any) {
    console.error("deleteEmployee error:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.status(500).json({ error: "Failed to delete employee" });
  }
}
