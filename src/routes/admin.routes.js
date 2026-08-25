import express from "Express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import { getUser, deleteUser } from "./../controllers/user.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import {
  getUsersQuerySchema,
  userIdSchema,
} from "./../validators/user.validator.js";
import {
  doctorIdSchema,
  getDoctorsQuerySchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
} from "../validators/doctor.validator.js";
import {
  getDoctors,
  updateDoctorByAdmin,
  updateDoctorStatus,
} from "../controllers/doctor.controller.js";

import {
  createClinicTimePolicy,
  getClinicTimePolicy,
  updateClinicTimePolicy,
} from "../controllers/clinic-time-policy.controller.js";

import {
  clinicTimePolicyClinicIdSchema,
  createClinicTimePolicySchema,
  updateClinicTimePolicySchema,
} from "../validators/clinic-time-policy.validator.js";

import upload from "../middlewares/upload.middleware.js";

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
  .route("/doctors")
  .get(
    auth,
    roleGuard("admin"),
    validate(getDoctorsQuerySchema, "query"),
    getDoctors,
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
router
  .route("/doctors/:doctorId")
  .patch(
    auth,
    roleGuard("admin"),
    upload.single("profileImage"),
    validate(doctorIdSchema, "params"),
    validate(updateDoctorSchema, "body"),
    updateDoctorByAdmin,
  );
router
  .route("/clinics/:clinicId/time-policy")
  .post(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    validate(createClinicTimePolicySchema, "body"),
    createClinicTimePolicy,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    getClinicTimePolicy,
  )
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    validate(updateClinicTimePolicySchema, "body"),
    updateClinicTimePolicy,
  );

export default router;
