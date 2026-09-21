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
  getDoctorBookings,
  getDoctorBookingById,
  completeDoctorBooking,
  markPatientNoShow,
} from "../controllers/booking.controller.js";

import { getDoctorSchedulesForPatient } from "./../controllers/doctor-schedule.controller.js";

import {
  createDoctorSchema,
  doctorIdSchema,
  updateDoctorSchema,
} from "./../validators/doctor.validator.js";

import { bookingIdSchema } from "./../validators/booking.validator.js";

import { paginationSchema } from "./../validators/pagination.validator.js";

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

// Static routes first
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
  .route("/bookings")
  .get(
    auth,
    roleGuard("doctor"),
    validate(paginationSchema, "query"),
    getDoctorBookings,
  );

router
  .route("/bookings/:bookingId/complete")
  .post(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    completeDoctorBooking,
  );
router
  .route("/bookings/:bookingId/no-show")
  .post(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    markPatientNoShow,
  );

router
  .route("/bookings/:bookingId")
  .get(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    getDoctorBookingById,
  );

// Dynamic routes after static routes
router
  .route("/:doctorId")
  .get(
    auth,
    roleGuard("patient", "doctor", "admin"),
    validate(doctorIdSchema, "params"),
    getDoctorById,
  );

router
  .route("/:doctorId/schedules")
  .get(
    auth,
    roleGuard("patient"),
    validate(doctorIdSchema, "params"),
    getDoctorSchedulesForPatient,
  );

export default router;
