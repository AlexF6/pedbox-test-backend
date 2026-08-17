import { Request, Response, NextFunction } from "express";

import {
  getCharacters,
  getCharacterById,
} from "../services/character.service";

export const getCharactersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getCharacters(page, limit);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCharacterByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const result = await getCharacterById(id);

    if (!result) {
      return res.status(404).json({
        message: "Character not found",
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};