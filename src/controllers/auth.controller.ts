import { Request, Response, NextFunction } from "express";

import {
  registerUser,
  loginUser,
} from "../services/auth.service";

import { authSchema } from "../utils/validation";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = authSchema.parse(req.body);

    const result = await registerUser(email, password);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = authSchema.parse(req.body);

    const result = await loginUser(email, password);

    res.json(result);
  } catch (error) {
    next(error);
  }
};