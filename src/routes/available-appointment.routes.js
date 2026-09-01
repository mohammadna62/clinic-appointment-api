import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { generateAppointments } from "../controllers/available-appointment.controller.js";

import { doctorIdAppointmentSchema } from "../validators/available-appointment.validator.js";

const router = express.Router();

router
  .route("/generate/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdAppointmentSchema, "params"),
    generateAppointments,
  );

export default router;
