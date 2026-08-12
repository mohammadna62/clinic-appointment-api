import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {deleteUser} from "./../controllers/user.controller.js"

const router = express.Router();

router.route("/users/:userId").delete(auth, roleGuard("admin"),deleteUser );

export default router;
