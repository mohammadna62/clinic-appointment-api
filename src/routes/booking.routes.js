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
import { createRating } from "../controllers/rating.controller.js";

import {
  appointmentIdBookingSchema,
  bookingIdSchema,
} from "../validators/booking.validator.js";

import { statisticsQuerySchema } from "../validators/statistics.validator.js";
import { paginationSchema } from "../validators/pagination.validator.js";
import { createRatingSchema } from "../validators/rating.validator.js";

const router = express.Router();


/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get the current patient's bookings
 *     tags: [Bookings]
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
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - patient role required
 */
router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(paginationSchema, "query"),
    getPatientBookings,
  );

 
/**
 * @swagger
 * /bookings/statistics:
 *   get:
 *     summary: Get statistics for the current doctor
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, 3months, 6months, year, 5years]
 *           default: month
 *         description: Period used to calculate statistics
 *     responses:
 *       200:
 *         description: Doctor statistics retrieved successfully
 *       400:
 *         description: Invalid statistics period
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - doctor role required
 */
router
  .route("/statistics")
  .get(
    auth,
    roleGuard("doctor"),
    validate(statisticsQuerySchema, "query"),
    getDoctorStatistics,
  );
  
/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   post:
 *     summary: Cancel a patient's booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the booking
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Invalid booking ID or booking cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or booking does not belong to the patient
 *       404:
 *         description: Booking not found
 */
router
  .route("/:bookingId/cancel")
  .post(
    auth,
    roleGuard("patient"),
    validate(bookingIdSchema, "params"),
    cancelPatientBooking,
  );

  
/**
 * @swagger
 * /bookings/{bookingId}/rating:
 *   post:
 *     summary: Rate a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 default: ""
 *             additionalProperties: false
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Invalid rating data or booking cannot be rated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - patient role required
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Rating already exists
 */
router
  .route("/:bookingId/rating")
  .post(
    auth,
    roleGuard("patient"),
    validate(bookingIdSchema, "params"),
    validate(createRatingSchema, "body"),
    createRating,
  );

  
/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get a patient's booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the booking
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden or booking does not belong to the patient
 *       404:
 *         description: Booking not found
 */
router
  .route("/:bookingId")
  .get(
    auth,
    roleGuard("patient"),
    validate(bookingIdSchema, "params"),
    getPatientBookingById,
  );

/**
 * @swagger
 * /bookings/{appointmentId}:
 *   post:
 *     summary: Create a booking for an available appointment
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the appointment
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid appointment ID or appointment cannot be booked
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - patient role required
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment is no longer available
 */
router
  .route("/:appointmentId")
  .post(
    auth,
    roleGuard("patient"),
    validate(appointmentIdBookingSchema, "params"),
    createBooking,
  );

export default router;
