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
router
  .route("/users")
  .get(
    auth,
    roleGuard("admin"),
    validate(getUsersQuerySchema, "query"),
    getUser,
  );

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
router
  .route("/ratings/:ratingId")
  .delete(
    auth,
    roleGuard("admin"),
    validate(ratingIdSchema, "params"),
    deleteRating,
  );

//* Clinic Routes

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
