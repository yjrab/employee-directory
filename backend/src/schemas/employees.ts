import { z } from "zod";

// Query / pagination schema
export const listQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Math.max(1, Number(val)) : 1)),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      const l = val ? Number(val) : 20;
      return Math.min(100, Math.max(1, l));
    }),
  search: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
});

// Params schema for :id
export const idParamSchema = z.object({
  id: z.string().min(1),
});

// Employee create schema
export const nestedUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    role: z.enum(["ADMIN", "EMPLOYEE"]).optional(),
    phone: z.string().optional(),
    pictureUrl: z.string().url().optional(),
  })
  .strict();

export const createEmployeeSchema = z
  .object({
    userId: z.string().uuid().optional(),
    user: nestedUserSchema.optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    pictureUrl: z.string().url().optional(),
    jobTitle: z.string().min(1),
    department: z.string().min(1),
    location: z.string().optional(),
    hireDate: z.preprocess((v) => (v ? new Date(v as string) : undefined), z.date().optional()),
  })
  .strict()
  .refine(
    (data) =>
      !!data.user || (!!data.firstName && !!data.lastName && !!data.email),
    {
      message: "Provide either nested user or top-level firstName, lastName, and email",
      path: ["user"],
    }
  );

export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  userId: z.undefined().optional(),
});