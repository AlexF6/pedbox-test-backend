/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Character:
 *       type: object
 *       required:
 *         - id
 *         - externalId
 *         - name
 *         - status
 *         - species
 *         - gender
 *         - image
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
 *           example: Rick Sanchez
 *
 *         status:
 *           type: string
 *           example: Alive
 *
 *         species:
 *           type: string
 *           example: Human
 *
 *         type:
 *           type: string
 *           nullable: true
 *           example: null
 *
 *         gender:
 *           type: string
 *           example: Male
 *
 *         image:
 *           type: string
 *           format: uri
 *           example: https://rickandmortyapi.com/api/character/avatar/1.jpeg
 *
 *         locationId:
 *           type: integer
 *           nullable: true
 *           example: 1
 *
 *         location:
 *           $ref: '#/components/schemas/Location'
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
 *
 *
 *     CharacterListResponse:
 *       type: object
 *       required:
 *         - data
 *         - pagination
 *         - filters
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Character'
 *
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 *
 *         filters:
 *           $ref: '#/components/schemas/CharacterFilters'
 *
 *
 *     CharacterFilters:
 *       type: object
 *       required:
 *         - name
 *         - status
 *         - species
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           nullable: true
 *           example: Rick
 *
 *         status:
 *           type: string
 *           nullable: true
 *           example: Alive
 *
 *         species:
 *           type: string
 *           nullable: true
 *           example: Human
 *
 *         gender:
 *           type: string
 *           nullable: true
 *           example: Male
 *
 *
 *     CharacterDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Character'
 *         - type: object
 *           properties:
 *             characterEpisodes:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CharacterEpisode'
 *
 *
 *     CharacterEpisode:
 *       type: object
 *       required:
 *         - characterId
 *         - episodeId
 *         - episode
 *       properties:
 *         characterId:
 *           type: integer
 *           example: 1
 *
 *         episodeId:
 *           type: integer
 *           example: 1
 *
 *         episode:
 *           $ref: '#/components/schemas/Episode'
 */