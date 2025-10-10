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
import { authenticate, requireAdmin, requireSelfEmployeeOrAdmin } from "../middleware/authMiddleware";

const router = Router();

router.get("/", validate(listQuerySchema, "query"), listEmployees);
router.get("/:id", validate(idParamSchema, "params"), getEmployee);
router.post("/", authenticate, requireAdmin, validate(createEmployeeSchema, "body"), createEmployee);
router.put("/:id", authenticate, requireSelfEmployeeOrAdmin, validate(idParamSchema, "params"), validate(updateEmployeeSchema, "body"), updateEmployee);
router.delete("/:id", authenticate, requireAdmin, validate(idParamSchema, "params"), deleteEmployee);

export default router;
