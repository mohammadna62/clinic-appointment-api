import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {getUser,deleteUser } from "./../controllers/user.controller.js"

const router = express.Router();

router.route("/users").get(auth, roleGuard("admin"), getUser)
router.route("/users/:userId").delete(auth, roleGuard("admin"),deleteUser );

export default router;
