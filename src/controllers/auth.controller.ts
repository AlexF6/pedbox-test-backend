import { Request, Response } from "express";

import {
  loginUser,
  registerUser,
} from "../services/auth.service";

export async function registerController(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await registerUser(
      email,
      password,
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
}

export async function loginController(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser(
      email,
      password,
    );

    res.json(result);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "INVALID_CREDENTIALS"
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
}