import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";


const router = express.Router();

router.route("/admin-test").get(auth, roleGuard("admin"), );

export default router;
