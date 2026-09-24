import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createBooking,
  getPatientBookings,
  getPatientBookingById,
  cancelPatientBooking,
  getDoctorStatistics,
} from "../controllers/booking.controller.js";

import {
  appointmentIdBookingSchema,
  bookingIdSchema,
} from "../validators/booking.validator.js";

import { statisticsQuerySchema } from "../validators/statistics.validator.js";
import { paginationSchema } from "../validators/pagination.validator.js";

const router = express.Router();

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(paginationSchema, "query"),
    getPatientBookings,
  );
router
  .route("/statistics")
  .get(
    auth,
    roleGuard("doctor"),
    validate(statisticsQuerySchema, "query"),
    getDoctorStatistics,
  );
router
  .route("/:bookingId/cancel")
  .post(
    auth,
    roleGuard("patient"),
    validate(bookingIdSchema, "params"),
    cancelPatientBooking,
  );
router
  .route("/:bookingId")
  .get(
    auth,
    roleGuard("patient"),
    validate(bookingIdSchema, "params"),
    getPatientBookingById,
  );

router
  .route("/:appointmentId")
  .post(
    auth,
    roleGuard("patient"),
    validate(appointmentIdBookingSchema, "params"),
    createBooking,
  );

export default router;
