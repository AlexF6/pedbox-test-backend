/**
 * @swagger
 * components:
 *   schemas:
 *
 *     Pagination:
 *       type: object
 *       required:
 *         - page
 *         - limit
 *         - total
 *         - totalPages
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         limit:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 *         total:
 *           type: integer
 *           minimum: 0
 *           example: 826
 *         totalPages:
 *           type: integer
 *           minimum: 0
 *           example: 83
 *
 *     ValidationError:
 *       type: object
 *       required:
 *         - error
 *         - details
 *       properties:
 *         error:
 *           type: string
 *           example: "Validation error"
 *         details:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - field
 *               - message
 *             properties:
 *               field:
 *                 type: string
 *                 example: "page"
 *               message:
 *                 type: string
 *                 example: "Too small: expected number to be >=1"
 *
 *     UnauthorizedError:
 *       type: object
 *       required:
 *         - message
 *       properties:
 *         message:
 *           type: string
 *           example: "Invalid or expired token"
 *
 *     InternalServerError:
 *       type: object
 *       required:
 *         - error
 *       properties:
 *         error:
 *           type: string
 *           example: "Internal server error"
 */