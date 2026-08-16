import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {getUser,deleteUser } from "./../controllers/user.controller.js"
import validate from "./../middlewares/validate.middleware.js"
import {getUsersQuerySchema} from "./../validators/user.validator.js"

const router = express.Router();

router.route("/users").get(auth, roleGuard("admin"),validate(getUsersQuerySchema,"query"), getUser)
router.route("/users/:userId").delete(auth, roleGuard("admin"),deleteUser );

export default router;
