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
import { getDoctorRatings } from "../controllers/rating.controller.js";

import { doctorRatingParamsSchema } from "../validators/rating.validator.js";

import {
  createDoctorSchema,
  doctorIdSchema,
  updateDoctorSchema,
} from "./../validators/doctor.validator.js";

import { bookingIdSchema } from "./../validators/booking.validator.js";

import { paginationSchema } from "./../validators/pagination.validator.js";

const router = express.Router();

/**
 * @swagger
 * /doctors:
 *   post:
 *     summary: Submit a doctor application
 *     description: Allows an authenticated patient to submit a doctor application with profile information and an optional profile image.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - clinic
 *               - specialty
 *               - medicalCode
 *               - consultationFee
 *             properties:
 *               clinic:
 *                 type: string
 *                 description: Clinic MongoDB ObjectId
 *               specialty:
 *                 type: string
 *                 description: Specialty MongoDB ObjectId
 *               medicalCode:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Doctor application submitted successfully
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only patients can submit a doctor application
 *       500:
 *         description: Internal server error
 */
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
/**
 * @swagger
 * /doctors/profile:
 *   patch:
 *     summary: Update the authenticated doctor's profile
 *     description: Updates the authenticated doctor's profile fields and optionally replaces the profile image.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               clinic:
 *                 type: string
 *                 description: Clinic MongoDB ObjectId
 *               specialty:
 *                 type: string
 *                 description: Specialty MongoDB ObjectId
 *               medicalCode:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Doctor profile updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can update their profiles
 *       500:
 *         description: Internal server error
 */
router
  .route("/profile")
  .patch(
    auth,
    roleGuard("doctor"),
    upload.single("profileImage"),
    validate(updateDoctorSchema, "body"),
    updateDoctor,
  );

  /**
 * @swagger
 * /doctors/bookings:
 *   get:
 *     summary: Get the authenticated doctor's bookings
 *     description: Returns a paginated list of bookings belonging to the authenticated doctor.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Doctor bookings retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can access their bookings
 *       500:
 *         description: Internal server error
 */
router
  .route("/bookings")
  .get(
    auth,
    roleGuard("doctor"),
    validate(paginationSchema, "query"),
    getDoctorBookings,
  );

  /**
 * @swagger
 * /doctors/bookings/{bookingId}/complete:
 *   post:
 *     summary: Mark a booking as completed
 *     description: Marks a booking as completed for the authenticated doctor.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Booking MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Booking completed successfully
 *       400:
 *         description: Invalid booking ID or booking state
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can complete bookings
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/bookings/:bookingId/complete")
  .post(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    completeDoctorBooking,
  );
  /**
 * @swagger
 * /doctors/bookings/{bookingId}/no-show:
 *   post:
 *     summary: Mark a patient as a no-show
 *     description: Marks the patient as a no-show for the specified booking.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Booking MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Patient marked as no-show successfully
 *       400:
 *         description: Invalid booking ID or booking state
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only doctors can mark patients as no-show
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/bookings/:bookingId/no-show")
  .post(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    markPatientNoShow,
  );
/**
 * @swagger
 * /doctors/bookings/{bookingId}:
 *   get:
 *     summary: Get a booking by ID
 *     description: Retrieves the specified booking for the authenticated doctor.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Booking MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/bookings/:bookingId")
  .get(
    auth,
    roleGuard("doctor"),
    validate(bookingIdSchema, "params"),
    getDoctorBookingById,
  );

// Dynamic routes after static routes
/**
 * @swagger
 * /doctors/{doctorId}/ratings:
 *   get:
 *     summary: Get ratings for a doctor
 *     description: Returns a paginated list of ratings for the specified doctor. Accessible to authenticated patients.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Doctor MongoDB ObjectId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Doctor ratings retrieved successfully
 *       400:
 *         description: Invalid doctor ID or pagination parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only patients can access this endpoint
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/:doctorId/ratings")
  .get(
    auth,
    roleGuard("patient"),
    validate(doctorRatingParamsSchema, "params"),
    validate(paginationSchema, "query"),
    getDoctorRatings,
  );
  /**
 * @swagger
 * /doctors/{doctorId}/schedules:
 *   get:
 *     summary: Get a doctor's schedules
 *     description: Retrieves the schedules for the specified doctor. Accessible to authenticated patients.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Doctor MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Doctor schedules retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only patients can access this endpoint
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/:doctorId/schedules")
  .get(
    auth,
    roleGuard("patient"),
    validate(doctorIdSchema, "params"),
    getDoctorSchedulesForPatient,
  );
  /**
 * @swagger
 * /doctors/{doctorId}:
 *   get:
 *     summary: Get doctor details
 *     description: Retrieves the details of a doctor by ID. Accessible to authenticated patients, doctors, and administrators.
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Doctor MongoDB ObjectId
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/:doctorId")
  .get(
    auth,
    roleGuard("patient", "doctor", "admin"),
    validate(doctorIdSchema, "params"),
    getDoctorById,
  );

export default router;
