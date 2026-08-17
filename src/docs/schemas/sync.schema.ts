/**
 * @swagger
 * components:
 *   schemas:
 *
 *     SyncResponse:
 *       type: object
 *       required:
 *         - synced
 *         - episodes
 *         - relationships
 *       properties:
 *         synced:
 *           type: integer
 *           minimum: 0
 *           description: Number of characters synchronized.
 *           example: 826
 *
 *         episodes:
 *           type: integer
 *           minimum: 0
 *           description: Number of episodes synchronized.
 *           example: 51
 *
 *         relationships:
 *           type: integer
 *           minimum: 0
 *           description: Number of character-episode relationships synchronized.
 *           example: 3655
 */