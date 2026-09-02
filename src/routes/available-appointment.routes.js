import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  generateAppointments,
  generateDoctorAppointments,
  generateNextDayAppointments,
} from "../controllers/available-appointment.controller.js";

import {
  doctorIdAppointmentSchema,
  generateAppointmentForDateSchema,
} from "../validators/available-appointment.validator.js";

const router = express.Router();


// Generate appointments for a specific date
router
  .route("/generate/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(
      doctorIdAppointmentSchema,
      "params",
    ),
    validate(
      generateAppointmentForDateSchema,
      "body",
    ),
    generateAppointments,
  );


// Initial 30-day generation
router
  .route("/generate-month/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(
      doctorIdAppointmentSchema,
      "params",
    ),
    generateDoctorAppointments,
  );


// Temporary manual test for rolling 30-day generation
router
  .route("/generate-next/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(
      doctorIdAppointmentSchema,
      "params",
    ),
    generateNextDayAppointments,
  );

export default router;