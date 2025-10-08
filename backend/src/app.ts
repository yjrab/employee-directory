import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth";
import employeesRouter from "./routes/employee";
import { notFoundHandler, errorHandler } from "./middleware/errorHandlers";

const app = express();

// Basic security + parsing
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/employees", employeesRouter);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
