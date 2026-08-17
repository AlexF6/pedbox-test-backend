import { Router } from "express";
import { syncController } from "../controllers/sync.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, syncController);

export default router;