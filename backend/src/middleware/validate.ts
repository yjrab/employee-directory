import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema, property: "body" | "query" | "params" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req[property]);
      next();
    } catch (err: any) {
      res.status(400).json({ error: err.errors ?? err.message });
    }
  };
