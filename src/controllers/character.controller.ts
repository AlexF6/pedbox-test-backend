import { Request, Response } from "express";
import {
  getCharacterById,
  getCharacters,
} from "../services/character.service";

export async function getCharactersController(
  req: Request,
  res: Response,
) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getCharacters({
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch characters",
    });
  }
}

export async function getCharacterByIdController(
  req: Request,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid character ID",
      });
    }

    const character = await getCharacterById(id);

    if (!character) {
      return res.status(404).json({
        message: "Character not found",
      });
    }

    res.json(character);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch character",
    });
  }
}