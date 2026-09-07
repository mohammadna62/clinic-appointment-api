import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  generateAppointments,
  generateDoctorAppointments,
  getAvailableAppointments,
} from "../controllers/available-appointment.controller.js";

import {
  doctorIdAppointmentSchema,
  generateAppointmentForDateSchema,
  getAvailableAppointmentsQuerySchema,
} from "../validators/available-appointment.validator.js";

const router = express.Router();

// Get available appointments

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(getAvailableAppointmentsQuerySchema, "query"),
    getAvailableAppointments,
  );

// Generate appointments for a specific date
router
  .route("/generate/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdAppointmentSchema, "params"),
    validate(generateAppointmentForDateSchema, "body"),
    generateAppointments,
  );

// Initial 30-day generation
router
  .route("/generate-month/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdAppointmentSchema, "params"),
    generateDoctorAppointments,
  );

export default router;
