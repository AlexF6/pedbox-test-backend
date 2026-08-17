import { Router } from "express";

import { syncController } from "../controllers/sync.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/sync:
 *   post:
 *     tags:
 *       - Sync
 *
 *     summary: Synchronize Rick and Morty data
 *
 *     description: |
 *       Synchronizes characters, locations, episodes and
 *       character-episode relationships from the Rick and Morty API
 *       into the local database.
 *
 *       This endpoint requires an authenticated user.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Synchronization completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SyncResponse'
 *
 *       401:
 *         description: Authentication required or token is invalid.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *
 *       500:
 *         description: Internal server error or external API synchronization failure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.post("/", authMiddleware, syncController);

export default router;