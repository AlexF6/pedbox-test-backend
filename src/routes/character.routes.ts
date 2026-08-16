import { Router } from "express";

import {
  getCharacterByIdController,
  getCharactersController,
} from "../controllers/character.controller";

const router = Router();

router.get("/", getCharactersController);

router.get("/:id", getCharacterByIdController);

export default router;