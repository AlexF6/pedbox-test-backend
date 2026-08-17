import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  getCharacters,
  getCharacterById,
} from "../services/character.service";

import {
  characterPaginationSchema,
} from "../utils/validation";

export const getCharactersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      page,
      limit,
      name,
      status,
      species,
      gender,
    } = characterPaginationSchema.parse(
      req.query,
    );

    const result = await getCharacters({
      page,
      limit,
      name,
      status,
      species,
      gender,
    });

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

    if (
      !Number.isInteger(id) ||
      id < 1
    ) {
      return res.status(400).json({
        message: "Invalid character id",
      });
    }

    const result =
      await getCharacterById(id);

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