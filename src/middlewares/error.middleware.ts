import {
  Request,
  Response,
  NextFunction,
} from "express";

import { ZodError } from "zod";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation error",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Error) {
    if (err.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }
  }

  return res.status(500).json({
    error: "Internal server error",
  });
};