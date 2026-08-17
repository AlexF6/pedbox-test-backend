import { Router } from "express";

import {
  getCharactersController,
  getCharacterByIdController,
} from "../controllers/character.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getCharactersController,
);

router.get(
  "/:id",
  authMiddleware,
  getCharacterByIdController,
);

export default router;