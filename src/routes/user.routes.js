import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import {
  banUser,
  unBanUser,
  updateUser,
} from "./../controllers/user.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import { updateProfileSchema } from "./../validators/auth.validator.js";
import { userIdSchema } from "../validators/user.validator.js";

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update current user's profile
 *     description: Updates one or more profile fields of the authenticated user.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Mohammad
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Naghavi
 *               nationalCode:
 *                 type: string
 *                 pattern: '^\d{10}$'
 *                 example: '1234567890'
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid user ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required or token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: National code is already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router
  .route("/profile")
  .patch(auth, validate(updateProfileSchema, "body"), updateUser);
/**
 * @swagger
 * /users/{userId}/ban:
 *   post:
 *     summary: Ban a user
 *     description: Allows an administrator to ban a user and invalidate their refresh token.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: MongoDB ObjectId of the user
 *         schema:
 *           type: string
 *           example: 66a123456789abcdef123456
 *     responses:
 *       200:
 *         description: User banned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required or token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Only administrators can ban users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router
  .route("/:userId/ban")
  .post(auth, roleGuard("admin"), validate(userIdSchema, "params"), banUser);
/**
 * @swagger
 * /users/{userId}/un-ban:
 *   post:
 *     summary: Unban a user
 *     description: Allows an administrator to remove a user's ban.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: MongoDB ObjectId of the user
 *         schema:
 *           type: string
 *           example: 66a123456789abcdef123456
 *     responses:
 *       200:
 *         description: User unbanned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required or token invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Only administrators can unban users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router
  .route("/:userId/un-ban")
  .post(auth, roleGuard("admin"), validate(userIdSchema, "params"), unBanUser);

export default router;
