/**
 * @swagger
 * components:
 *   schemas:
 *
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *
 *
 *     AuthCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: password123
 *
 *
 *     RegisterResponse:
 *       type: object
 *       required:
 *         - id
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *
 *
 *     LoginResponse:
 *       type: object
 *       required:
 *         - token
 *         - user
 *       properties:
 *         token:
 *           type: string
 *           description: JWT access token.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *         user:
 *           $ref: '#/components/schemas/User'
 */