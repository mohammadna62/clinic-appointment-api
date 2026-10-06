import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { getActiveSpecialties } from "../controllers/specialty.controller.js";
import { getActiveDoctorsBySpecialty } from "../controllers/doctor.controller.js";

import { specialtyIdSchema } from "../validators/specialty.validator.js";
import { paginationSchema } from "../validators/pagination.validator.js";

const router = express.Router();

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(paginationSchema, "query"),
    getActiveSpecialties,
  );

router
  .route("/:specialtyId/doctors")
  .get(
    auth,
    roleGuard("patient"),
    validate(specialtyIdSchema, "params"),
    validate(paginationSchema, "query"),
    getActiveDoctorsBySpecialty,
  );

export default router;