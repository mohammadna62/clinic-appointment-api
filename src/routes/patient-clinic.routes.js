import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { getActiveClinics } from "../controllers/clinic.controller.js";
import {getActiveDoctorsByClinic} from "./../controllers/doctor.controller.js"

import { paginationSchema } from "../validators/pagination.validator.js";

import {clinicIdSchema} from "./../validators/doctor.validator.js"

const router = express.Router();

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(paginationSchema, "query"),
    getActiveClinics,
  );

router
  .route("/:clinicId/doctors")
  .get(
    auth,
    roleGuard("patient"),
    validate(clinicIdSchema, "params"),
    validate(paginationSchema, "query"),
    getActiveDoctorsByClinic,
  );
export default router;
