/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Location:
 *       type: object
 *       required:
 *         - id
 *         - externalId
 *         - name
 *         - createdAt
 *         - updatedAt
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *
 *         externalId:
 *           type: integer
 *           example: 1
 *
 *         name:
 *           type: string
 *           example: Earth
 *
 *         type:
 *           type: string
 *           nullable: true
 *           example: Planet
 *
 *         dimension:
 *           type: string
 *           nullable: true
 *           example: Dimension C-137
 *
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-17T12:00:00.000Z"
 *
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-08-17T12:00:00.000Z"
 */