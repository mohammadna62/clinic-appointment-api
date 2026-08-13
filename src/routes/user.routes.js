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

const router = express.Router();

router.route("/profile").patch(auth, validate(updateProfileSchema), updateUser);
router.route("/:userId/ban").post(auth, roleGuard("admin"), banUser);
router.route("/:userId/un-ban").post(auth, roleGuard("admin"), unBanUser);


export default router;
