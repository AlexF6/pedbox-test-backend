import { Router } from "express";

import {
  getCharactersController,
  getCharacterByIdController,
} from "../controllers/character.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/characters:
 *   get:
 *     tags:
 *       - Characters
 *
 *     summary: Get characters
 *
 *     description: |
 *       Returns a paginated list of characters stored in the database.
 *
 *       Supports filtering by name, status, species and gender.
 *
 *       Authentication is required using a JWT Bearer token.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of characters per page.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *
 *       - in: query
 *         name: name
 *         required: false
 *         description: Filter characters by name. Uses partial matching.
 *         schema:
 *           type: string
 *         example: Rick
 *
 *       - in: query
 *         name: status
 *         required: false
 *         description: Filter characters by status.
 *         schema:
 *           type: string
 *         example: Alive
 *
 *       - in: query
 *         name: species
 *         required: false
 *         description: Filter characters by species.
 *         schema:
 *           type: string
 *         example: Human
 *
 *       - in: query
 *         name: gender
 *         required: false
 *         description: Filter characters by gender.
 *         schema:
 *           type: string
 *         example: Male
 *
 *     responses:
 *
 *       200:
 *         description: Characters retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - data
 *                 - pagination
 *                 - filters
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Character'
 *
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *
 *                 filters:
 *                   type: object
 *                   required:
 *                     - name
 *                     - status
 *                     - species
 *                     - gender
 *                   properties:
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       example: Rick
 *                     status:
 *                       type: string
 *                       nullable: true
 *                       example: Alive
 *                     species:
 *                       type: string
 *                       nullable: true
 *                       example: Human
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                       example: Male
 *
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *
 *       401:
 *         description: Authentication failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.get(
  "/",
  authMiddleware,
  getCharactersController,
);

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     tags:
 *       - Characters
 *
 *     summary: Get character by ID
 *
 *     description: |
 *       Returns a single character by its internal database ID.
 *
 *       The response includes the character's location and
 *       associated episodes.
 *
 *       Authentication is required using a JWT Bearer token.
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Internal database ID of the character.
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 1
 *
 *     responses:
 *
 *       200:
 *         description: Character retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CharacterDetail'
 *
 *       400:
 *         description: Invalid character ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid character id
 *
 *       401:
 *         description: Authentication failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *
 *       404:
 *         description: Character not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - message
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Character not found
 *
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerError'
 */
router.get(
  "/:id",
  authMiddleware,
  getCharacterByIdController,
);

export default router;