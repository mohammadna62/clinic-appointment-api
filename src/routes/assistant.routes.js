import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { chat } from "../controllers/assistant.controller.js";
import { assistantChatSchema } from "../validators/assistant.validator.js";

const router = express.Router();

router
  .route("/chat")
  .post(
    auth,
    roleGuard("patient"),
    validate(assistantChatSchema, "body"),
    chat,
  );

export default router;