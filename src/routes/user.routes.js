import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import { banUser, unBanUser } from "./../controllers/user.controller.js";

const router = express.Router();

router.route("/:userId/ban").post(auth, roleGuard("admin"), banUser);
router.route("/:userId/un-ban").post(auth, roleGuard("admin"), unBanUser);

export default router;
