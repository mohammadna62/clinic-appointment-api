import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { createBooking } from "../controllers/booking.controller.js";

import { appointmentIdBookingSchema } from "../validators/booking.validator.js";

const router = express.Router();

router
  .route("/:appointmentId")
  .post(
    auth,
    roleGuard("patient"),
    validate(appointmentIdBookingSchema, "params"),
    createBooking,
  );

export default router;
