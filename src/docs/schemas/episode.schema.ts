/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Episode:
 *       type: object
 *       required:
 *         - id
 *         - externalId
 *         - name
 *         - airDate
 *         - episodeCode
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
 *           example: Pilot
 *
 *         airDate:
 *           type: string
 *           example: December 2, 2013
 *
 *         episodeCode:
 *           type: string
 *           example: S01E01
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