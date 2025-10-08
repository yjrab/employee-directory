import { Router } from "express";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  idParamSchema,
  listQuerySchema,
} from "../schemas/employees";
import { validate } from "../middleware/validate";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", validate(listQuerySchema, "query"), listEmployees);
router.get("/:id", validate(idParamSchema, "params"), getEmployee);
router.post("/", authenticate, validate(createEmployeeSchema, "body"), createEmployee);
router.put("/:id", authenticate, validate(idParamSchema, "params"), validate(updateEmployeeSchema, "body"), updateEmployee);
router.delete("/:id", authenticate, validate(idParamSchema, "params"), deleteEmployee);

export default router;
