import { Request, Response, NextFunction } from "express";
import { syncCharacters } from "../services/sync.service";

export const syncController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await syncCharacters();

    res.json(result);
  } catch (error) {
    next(error);
  }
};