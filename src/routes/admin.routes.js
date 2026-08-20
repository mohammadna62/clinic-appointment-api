import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import { getUser, deleteUser } from "./../controllers/user.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import {
  getUsersQuerySchema,
  userIdSchema,
} from "./../validators/user.validator.js";
import { doctorIdSchema,updateDoctorStatusSchema } from "../validators/doctor.validator.js";
import { updateDoctorStatus } from "../controllers/doctor.controller.js";



const router = express.Router();

router
  .route("/users")
  .get(
    auth,
    roleGuard("admin"),
    validate(getUsersQuerySchema, "query"),
    getUser,
  );
router
  .route("/users/:userId")
  .delete(
    auth,
    roleGuard("admin"),
    validate(userIdSchema, "params"),
    deleteUser,
  );
router
  .route("/doctors/:doctorId/status")
  .patch(
    auth,
    roleGuard("admin"),
    validate(doctorIdSchema, "params"),
    validate(updateDoctorStatusSchema, "body"),
    updateDoctorStatus,
  );
  
export default router;
