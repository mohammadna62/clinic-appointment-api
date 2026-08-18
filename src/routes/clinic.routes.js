import express from "express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  updateClinicStatus
} from "./../controllers/clinic.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import {
  createClinicSchema,
  clinicIdSchema,
  updateClinicSchema,
  updateClinicStatusSchema,
} from "./../validators/clinic.validator.js";
import { paginationSchema } from "../validators/pagination.validator.js";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    roleGuard("admin"),
    validate(createClinicSchema, "body"),
    createClinic,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(paginationSchema, "query"),
    getClinics,
  );

router
  .route("/:clinicId")
  .get(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    getClinicById,
  )
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    validate(updateClinicSchema, "body"),
    updateClinic,
  );
router
  .route("/:clinicId/status")
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    validate(updateClinicStatusSchema, "body"),
    updateClinicStatus,
  );
export default router;
