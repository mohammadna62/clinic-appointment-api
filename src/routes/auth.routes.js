import express from "express";

import {
  sentOtp,
  verifyOtp,
  getMe,
  refreshToken,
  completeProfile,
  logout,
} from "./../controllers/auth.controller.js";

import {
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  completeProfileSchema,
} from "../validators/auth.validator.js";

import validate from "../middlewares/validate.middleware.js";
import auth from "./../middlewares/auth.middleware.js";
import otpRateLimit from "../middlewares/otp-rate-limit.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Request an OTP
 *     description: Sends a one-time password to the provided Iranian mobile number. OTP requests are subject to rate limiting and resend cooldown.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^09\d{9}$'
 *                 example: '09123456789'
 *     responses:
 *       200:
 *         description: OTP sent successfully.
 *       400:
 *         description: Invalid request data.
 *       403:
 *         description: The user is banned.
 *       429:
 *         description: OTP resend cooldown is active.
 *       500:
 *         description: Internal server error.
 */
router
  .route("/send-otp")
  .post(otpRateLimit, validate(sendOtpSchema, "body"), sentOtp);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and authenticate user
 *     description: Verifies the OTP, creates a user when necessary, and returns access and refresh tokens.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^09\d{9}$'
 *                 example: '09123456789'
 *               otp:
 *                 type: string
 *                 pattern: '^\d{6}$'
 *                 example: '123456'
 *     responses:
 *       201:
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       description: The authenticated user's data.
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *                     profileCompleted:
 *                       type: boolean
 *       400:
 *         description: OTP is invalid or expired, or request data is invalid.
 *       403:
 *         description: The user is banned.
 *       500:
 *         description: Internal server error.
 */
router.route("/verify-otp").post(validate(verifyOtpSchema, "body"), verifyOtp);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile and profile completion status.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *       401:
 *         description: Authentication is required or the token is invalid.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
router.route("/me").get(auth, getMe);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh authentication tokens
 *     description: Validates the refresh token and returns a new access token and refresh token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       400:
 *         description: Invalid request data.
 *       401:
 *         description: Refresh token is invalid, expired, or unavailable.
 *       403:
 *         description: The user is banned or the account has been deleted.
 *       500:
 *         description: Internal server error.
 */
router
  .route("/refresh-token")
  .post(validate(refreshTokenSchema, "body"), refreshToken);

/**
 * @swagger
 * /auth/profile/complete:
 *   patch:
 *     summary: Complete user profile
 *     description: Saves the user's first name, last name, and national code.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - nationalCode
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
 *     responses:
 *       200:
 *         description: Profile completed successfully.
 *       400:
 *         description: Invalid request data or user ID.
 *       401:
 *         description: Authentication is required or the token is invalid.
 *       404:
 *         description: User not found.
 *       409:
 *         description: National code is already in use.
 *       500:
 *         description: Internal server error.
 */
router
  .route("/profile/complete")
  .patch(auth, validate(completeProfileSchema, "body"), completeProfile);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out current user
 *     description: Invalidates the stored refresh token for the authenticated user.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Authentication is required or the token is invalid.
 *       500:
 *         description: Internal server error.
 */
router.route("/logout").post(auth, logout);

export default router;
