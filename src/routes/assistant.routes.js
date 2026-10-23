import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { chat } from "../controllers/assistant.controller.js";
import { assistantChatSchema } from "../validators/assistant.validator.js";

const router = express.Router();

/**
 * @swagger
 * /assistant/chat:
 *   post:
 *     summary: Send a message to the AI assistant
 *     description: Sends a message to the assistant and returns the generated response. Only authenticated patients can access this endpoint.
 *     tags: [Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Message sent to the assistant
 *                 example: What are the available appointment options?
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Assistant response generated successfully
 *       400:
 *         description: Invalid request body or message
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
router
  .route("/chat")
  .post(
    auth,
    roleGuard("patient"),
    validate(assistantChatSchema, "body"),
    chat,
  );

export default router;