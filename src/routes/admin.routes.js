import express from "express";

import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import { getUser, deleteUser } from "../controllers/user.controller.js";

//* Validator

import validate from "../middlewares/validate.middleware.js";

import {
  getUsersQuerySchema,
  userIdSchema,
} from "../validators/user.validator.js";

import {
  doctorIdSchema,
  getDoctorsQuerySchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
} from "../validators/doctor.validator.js";

import {
  clinicTimePolicyClinicIdSchema,
  createClinicTimePolicySchema,
  updateClinicTimePolicySchema,
} from "../validators/clinic-time-policy.validator.js";

import {
  weeklyScheduleClinicIdSchema,
  weeklyScheduleIdSchema,
  createWeeklyScheduleSchema,
  updateWeeklyScheduleSchema,
} from "../validators/weekly-schedule.validator.js";

import {
  doctorIdScheduleSchema,
  doctorScheduleParamsSchema,
  createDoctorScheduleSchema,
  updateDoctorScheduleSchema,
} from "./../validators/doctor-schedule.validator.js";

import {
  doctorIdAppointmentSchema,
  generateAppointmentForDateSchema,
  appointmentIdSchema,
  updateAppointmentStatusSchema,
  adminAppointmentQuerySchema,
} from "../validators/available-appointment.validator.js";

import {
  adminBookingQuerySchema,
  bookingIdSchema,
} from "../validators/booking.validator.js";

import {
  paymentIdSchema,
  adminPaymentQuerySchema,
} from "../validators/payment.validator.js";

import { statisticsQuerySchema } from "../validators/statistics.validator.js";
import {
  doctorRatingParamsSchema,
  ratingIdSchema,
} from "../validators/rating.validator.js";

import { paginationSchema } from "../validators/pagination.validator.js";

//* Controller

import {
  getDoctors,
  updateDoctorByAdmin,
  updateDoctorStatus,
} from "../controllers/doctor.controller.js";

import {
  createClinicTimePolicy,
  getClinicTimePolicy,
  updateClinicTimePolicy,
} from "../controllers/clinic-time-policy.controller.js";

import {
  createWeeklySchedule,
  getWeeklySchedules,
  updateWeeklySchedule,
  deleteWeeklySchedule,
} from "../controllers/weekly-schedule.controller.js";

import {
  createDoctorSchedule,
  getDoctorSchedules,
  updateDoctorSchedule,
  deleteDoctorSchedule,
} from "./../controllers/doctor-schedule.controller.js";

import {
  generateAppointments,
  generateDoctorAppointments,
  updateAppointmentStatus,
  getAdminAppointments,
} from "../controllers/available-appointment.controller.js";

import {
  getAdminBookings,
  getAdminBookingById,
} from "../controllers/booking.controller.js";

import {
  getAdminPayments,
  getAdminPaymentById,
  refundPayment,
} from "./../controllers/payment.controller.js";

import {
  getAdminDoctorRatings,
  deleteRating,
} from "../controllers/rating.controller.js";

import { getAdminStatistics } from "../controllers/admin-statistics.controller.js";

const router = express.Router();

//* Statistic Routes


/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     summary: Get admin statistics
 *     description: Retrieves dashboard statistics for the selected time period.
 *     tags: [Admin - Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - day
 *             - week
 *             - month
 *             - 3months
 *             - 6months
 *             - year
 *             - 5years
 *           default: month
 *         description: Time period used to calculate statistics. Defaults to month when omitted.
 *         example: 3months
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       400:
 *         description: Invalid period query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router
  .route("/statistics")
  .get(
    auth,
    roleGuard("admin"),
    validate(statisticsQuerySchema, "query"),
    getAdminStatistics,
  );


//* User Routes

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get users
 *     description: Retrieves a paginated list of users. Requires administrator access.
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, banned, deleted]
 *         description: Filter users by status
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/users")
  .get(
    auth,
    roleGuard("admin"),
    validate(getUsersQuerySchema, "query"),
    getUser,
  );


/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user by ID. Requires administrator access.
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router
  .route("/users/:userId")
  .delete(
    auth,
    roleGuard("admin"),
    validate(userIdSchema, "params"),
    deleteUser,
  );

//* Doctor Routes


/**
 * @swagger
 * /admin/doctors:
 *   get:
 *     summary: Get doctors
 *     description: Retrieves a paginated list of doctors. Requires administrator access.
 *     tags: [Admin - Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter doctors by their active status
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
 *         description: Number of doctors per page
 *     responses:
 *       200:
 *         description: Doctors retrieved successfully
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/doctors")
  .get(
    auth,
    roleGuard("admin"),
    validate(getDoctorsQuerySchema, "query"),
    getDoctors,
  );



/**
 * @swagger
 * /admin/doctors/{doctorId}/status:
 *   patch:
 *     summary: Update doctor status
 *     description: Activates or deactivates a doctor account. Requires administrator access.
 *     tags: [Admin - Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Set true to activate or false to deactivate the doctor
 *                 example: true
 *             additionalProperties: false
 *           example:
 *             isActive: true
 *     responses:
 *       200:
 *         description: Doctor status updated successfully
 *       400:
 *         description: Invalid doctor ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/doctors/:doctorId/status")
  .patch(
    auth,
    roleGuard("admin"),
    validate(doctorIdSchema, "params"),
    validate(updateDoctorStatusSchema, "body"),
    updateDoctorStatus,
  );


/**
 * @swagger
 * /admin/doctors/{doctorId}/ratings:
 *   get:
 *     summary: Get doctor ratings
 *     description: Retrieves a paginated list of ratings for a specific doctor. Requires administrator access.
 *     tags: [Admin - Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the doctor
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
 *         description: Number of ratings per page
 *     responses:
 *       200:
 *         description: Doctor ratings retrieved successfully
 *       400:
 *         description: Invalid doctor ID or pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/doctors/:doctorId/ratings")
  .get(
    auth,
    roleGuard("admin"),
    validate(doctorRatingParamsSchema, "params"),
    validate(paginationSchema, "query"),
    getAdminDoctorRatings,
  );

/**
 * @swagger
 * /admin/doctors/{doctorId}/schedules:
 *   post:
 *     summary: Create a doctor schedule
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dayOfWeek
 *               - startTime
 *               - endTime
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "17:00"
 *     responses:
 *       201:
 *         description: Doctor schedule created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *
 *   get:
 *     summary: Get a doctor's schedules
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *     responses:
 *       200:
 *         description: Doctor schedules retrieved successfully
 *       400:
 *         description: Invalid doctor ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 */
router
  .route("/doctors/:doctorId/schedules")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdScheduleSchema, "params"),
    validate(createDoctorScheduleSchema, "body"),
    createDoctorSchedule,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(doctorIdScheduleSchema, "params"),
    getDoctorSchedules,
  );


/**
 * @swagger
 * /admin/doctors/{doctorId}/schedules/{scheduleId}:
 *   patch:
 *     summary: Update a doctor schedule
 *     description: Updates the start time, end time, or active status of a doctor's schedule. Requires administrator access.
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the schedule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               startTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "12:00"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *             additionalProperties: false
 *             description: At least one field is required. If both times are provided, startTime must be before endTime.
 *           example:
 *             startTime: "09:00"
 *             endTime: "12:00"
 *     responses:
 *       200:
 *         description: Doctor schedule updated successfully
 *       400:
 *         description: Invalid doctor ID, schedule ID, or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor or schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete a doctor schedule
 *     description: Deletes a specific schedule belonging to a doctor. Requires administrator access.
 *     tags: [Doctor Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the schedule
 *     responses:
 *       200:
 *         description: Doctor schedule deleted successfully
 *       400:
 *         description: Invalid doctor ID or schedule ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor or schedule not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/doctors/:doctorId/schedules/:scheduleId")
  .patch(
    auth,
    roleGuard("admin"),
    validate(doctorScheduleParamsSchema, "params"),
    validate(updateDoctorScheduleSchema, "body"),
    updateDoctorSchedule,
  )
  .delete(
    auth,
    roleGuard("admin"),
    validate(doctorScheduleParamsSchema, "params"),
    deleteDoctorSchedule,
  );


/**
 * @swagger
 * /admin/doctors/{doctorId}:
 *   patch:
 *     summary: Update doctor information
 *     description: Allows an administrator to update a doctor's profile information, including the profile image.
 *     tags: [Admin - Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               clinic:
 *                 type: string
 *                 description: Clinic ID
 *               specialty:
 *                 type: string
 *                 description: Specialty ID
 *               medicalCode:
 *                 type: string
 *                 description: Doctor's medical code
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *               consultationFee:
 *                 type: number
 *                 exclusiveMinimum: 0
 *               profileImage:
 *                 type: string
 *                 format: binary
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Doctor information updated successfully
 *       400:
 *         description: Invalid doctor ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Doctor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route("/doctors/:doctorId")
  .patch(
    auth,
    roleGuard("admin"),
    upload.single("profileImage"),
    validate(doctorIdSchema, "params"),
    validate(updateDoctorSchema, "body"),
    updateDoctorByAdmin,
  );


//* Rating Routes

/**
 * @swagger
 * /admin/ratings/{ratingId}:
 *   delete:
 *     summary: Delete a rating
 *     description: Deletes a rating by ID. Requires administrator access.
 *     tags: [Admin - Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the rating
 *     responses:
 *       200:
 *         description: Rating deleted successfully
 *       400:
 *         description: Invalid rating ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router
  .route("/ratings/:ratingId")
  .delete(
    auth,
    roleGuard("admin"),
    validate(ratingIdSchema, "params"),
    deleteRating,
  );

//* Clinic Routes


/**
 * @swagger
 * /admin/clinics/{clinicId}/time-policy:
 *   post:
 *     summary: Create clinic time policy
 *     description: Creates the time policy for a clinic. Requires administrator access.
 *     tags: [Admin - Clinic Time Policy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - morningStart
 *               - morningEnd
 *               - eveningStart
 *               - eveningEnd
 *               - appointmentDuration
 *             properties:
 *               morningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "08:00"
 *                 description: Morning session start time in 24-hour HH:mm format
 *               morningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "12:00"
 *                 description: Morning session end time in 24-hour HH:mm format
 *               eveningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "16:00"
 *                 description: Evening session start time in 24-hour HH:mm format
 *               eveningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "20:00"
 *                 description: Evening session end time in 24-hour HH:mm format
 *               appointmentDuration:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 180
 *                 example: 30
 *                 description: Appointment duration in minutes
 *     responses:
 *       201:
 *         description: Clinic time policy created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Clinic time policy created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     policy:
 *                       type: object
 *                       description: Created clinic time policy
 *       400:
 *         description: Invalid clinic ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     summary: Get clinic time policy
 *     description: Retrieves the time policy for a clinic. Requires administrator access.
 *     tags: [Admin - Clinic Time Policy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *     responses:
 *       200:
 *         description: Clinic time policy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Clinic time policy retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     policy:
 *                       type: object
 *                       description: Retrieved clinic time policy
 *       400:
 *         description: Invalid clinic ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   patch:
 *     summary: Update clinic time policy
 *     description: Updates the time policy for a clinic. Only supplied fields are updated. Requires administrator access.
 *     tags: [Admin - Clinic Time Policy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               morningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "08:30"
 *               morningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "12:30"
 *               eveningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "16:30"
 *               eveningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "20:30"
 *               appointmentDuration:
 *                 type: integer
 *                 minimum: 5
 *                 maximum: 180
 *                 example: 30
 *                 description: Appointment duration in minutes
 *             minProperties: 1
 *     responses:
 *       200:
 *         description: Clinic time policy updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Clinic time policy updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     policy:
 *                       type: object
 *                       description: Updated clinic time policy
 *       400:
 *         description: Invalid clinic ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router
  .route("/clinics/:clinicId/time-policy")
  .post(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    validate(createClinicTimePolicySchema, "body"),
    createClinicTimePolicy,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    getClinicTimePolicy,
  )
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicTimePolicyClinicIdSchema, "params"),
    validate(updateClinicTimePolicySchema, "body"),
    updateClinicTimePolicy,
  );

  
/**
 * @swagger
 * /admin/clinics/{clinicId}/weekly-schedule:
 *   post:
 *     summary: Create a weekly schedule
 *     description: Creates a weekly schedule entry for a clinic. Requires administrator access.
 *     tags: [Admin - Weekly Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - dayOfWeek
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *                 example: 1
 *                 description: Day of the week, where 0 is Sunday and 6 is Saturday
 *               isActive:
 *                 type: boolean
 *                 description: Whether this schedule entry is active
 *                 example: true
 *               morningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "08:00"
 *                 description: Morning session start time in HH:mm format
 *               morningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "12:00"
 *                 description: Morning session end time in HH:mm format
 *               eveningStart:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "16:00"
 *                 description: Evening session start time in HH:mm format
 *               eveningEnd:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "20:00"
 *                 description: Evening session end time in HH:mm format
 *     responses:
 *       201:
 *         description: Weekly schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Weekly schedule created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     schedule:
 *                       type: object
 *                       description: Created weekly schedule
 *       400:
 *         description: Invalid clinic ID or request body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     summary: Get weekly schedules for a clinic
 *     description: Retrieves the weekly schedule entries for a clinic. Requires administrator access.
 *     tags: [Admin - Weekly Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *     responses:
 *       200:
 *         description: Weekly schedules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Weekly schedules retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         description: Weekly schedule entry
 *       400:
 *         description: Invalid clinic ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Administrator access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router
  .route("/clinics/:clinicId/weekly-schedule")
  .post(
    auth,
    roleGuard("admin"),
    validate(weeklyScheduleClinicIdSchema, "params"),
    validate(createWeeklyScheduleSchema, "body"),
    createWeeklySchedule,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(weeklyScheduleClinicIdSchema, "params"),
    getWeeklySchedules,
  );

  /**
 * @swagger
 * /admin/clinics/{clinicId}/weekly-schedule/{scheduleId}:
 *   patch:
 *     summary: Update a clinic weekly schedule
 *     tags: [Admin - Weekly Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the weekly schedule
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: Whether this weekly schedule is active
 *               morningStart:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "08:00"
 *                 description: Morning session start time in HH:mm format, or null
 *               morningEnd:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "12:00"
 *                 description: Morning session end time in HH:mm format, or null
 *               eveningStart:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "16:00"
 *                 description: Evening session start time in HH:mm format, or null
 *               eveningEnd:
 *                 type: string
 *                 nullable: true
 *                 pattern: '^([01]\d|2[0-3]):[0-5]\d$'
 *                 example: "20:00"
 *                 description: Evening session end time in HH:mm format, or null
 *     responses:
 *       200:
 *         description: Weekly schedule updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete a clinic weekly schedule
 *     tags: [Admin - Weekly Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the clinic
 *       - in: path
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the weekly schedule
 *     responses:
 *       200:
 *         description: Weekly schedule deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route("/clinics/:clinicId/weekly-schedule/:scheduleId")
  .patch(
    auth,
    roleGuard("admin"),
    validate(weeklyScheduleIdSchema, "params"),
    validate(updateWeeklyScheduleSchema, "body"),
    updateWeeklySchedule,
  )
  .delete(
    auth,
    roleGuard("admin"),
    validate(weeklyScheduleIdSchema, "params"),
    deleteWeeklySchedule,
  );

//* Appointment Routes

/**
 * @swagger
 * /admin/available-appointments/generate/{doctorId}:
 *   post:
 *     summary: Generate appointments for a doctor on a specific date
 *     tags: [Admin - Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             additionalProperties: false
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-10-20T00:00:00.000Z"
 *                 description: Date for which appointments should be generated
 *     responses:
 *       201:
 *         description: Appointments generated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /admin/available-appointments/generate-month/{doctorId}:
 *   post:
 *     summary: Generate appointments for a doctor
 *     description: Generates doctor appointments using the configured generation service.
 *     tags: [Admin - Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the doctor
 *     responses:
 *       201:
 *         description: Doctor appointments generated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /admin/available-appointments/{appointmentId}/status:
 *   patch:
 *     summary: Update appointment status
 *     tags: [Admin - Appointments]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             additionalProperties: false
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - available
 *                   - suspended
 *                 example: suspended
 *                 description: New appointment status
 *     responses:
 *       200:
 *         description: Appointment status updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /admin/appointments:
 *   get:
 *     summary: Get appointments for administration
 *     tags: [Admin - Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of appointments per page
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - available
 *             - reserved
 *             - booked
 *             - suspended
 *         description: Filter appointments by status
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route("/available-appointments/generate/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdAppointmentSchema, "params"),
    validate(generateAppointmentForDateSchema, "body"),
    generateAppointments,
  );

router
  .route("/available-appointments/generate-month/:doctorId")
  .post(
    auth,
    roleGuard("admin"),
    validate(doctorIdAppointmentSchema, "params"),
    generateDoctorAppointments,
  );

router
  .route("/available-appointments/:appointmentId/status")
  .patch(
    auth,
    roleGuard("admin"),
    validate(appointmentIdSchema, "params"),
    validate(updateAppointmentStatusSchema, "body"),
    updateAppointmentStatus,
  );
router
  .route("/appointments")
  .get(
    auth,
    roleGuard("admin"),
    validate(adminAppointmentQuerySchema, "query"),
    getAdminAppointments,
  );
//* Booking Routes
/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get bookings for administration
 *     tags: [Admin - Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - pending
 *             - confirmed
 *             - cancelled
 *             - completed
 *             - patient_no_show
 *         description: Filter bookings by status
 *     responses:
 *       200:
 *         description: Admin bookings retrieved successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * /admin/bookings/{bookingId}:
 *   get:
 *     summary: Get a booking by ID for administration
 *     tags: [Admin - Bookings]
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
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router
  .route("/bookings")
  .get(
    auth,
    roleGuard("admin"),
    validate(adminBookingQuerySchema, "query"),
    getAdminBookings,
  );

router
  .route("/bookings/:bookingId")
  .get(
    auth,
    roleGuard("admin"),
    validate(bookingIdSchema, "params"),
    getAdminBookingById,
  );
//* Payment Routes
router
  .route("/payments")
  .get(
    auth,
    roleGuard("admin"),
    validate(adminPaymentQuerySchema, "query"),
    getAdminPayments,
  );

router
  .route("/payments/:paymentId")
  .get(
    auth,
    roleGuard("admin"),
    validate(paymentIdSchema, "params"),
    getAdminPaymentById,
  );
router
  .route("/payments/:paymentId/refund")
  .post(
    auth,
    roleGuard("admin"),
    validate(paymentIdSchema, "params"),
    refundPayment,
  );

export default router;
