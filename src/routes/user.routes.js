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

router
  .route("/profile")
  .patch(auth, validate(updateProfileSchema, "body"), updateUser);
router
  .route("/:userId/ban")
  .post(auth, roleGuard("admin"), validate(userIdSchema, "params"), banUser);
router
  .route("/:userId/un-ban")
  .post(auth, roleGuard("admin"), validate(userIdSchema, "params"), unBanUser);

export default router;
