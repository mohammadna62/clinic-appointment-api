import express from "express";

import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import upload from "./../middlewares/upload.middleware.js";

import {
  createDoctor,
  getDoctorById,
  updateDoctor,
} from "../controllers/doctor.controller.js";

import {
  createDoctorSchema,
  doctorIdSchema,
  updateDoctorSchema,
} from "./../validators/doctor.validator.js";

const router = express.Router();

router
  .route("/")
  .post(
    auth,
    roleGuard("patient"),
    upload.single("profileImage"),
    validate(createDoctorSchema, "body"),
    createDoctor,
  );

router
  .route("/profile")
  .patch(
    auth,
    roleGuard("doctor"),
    upload.single("profileImage"),
    validate(updateDoctorSchema, "body"),
    updateDoctor,
  );

router
  .route("/:doctorId")
  .get(
    auth,
    roleGuard("patient", "doctor", "admin"),
    validate(doctorIdSchema, "params"),
    getDoctorById,
  );

export default router;