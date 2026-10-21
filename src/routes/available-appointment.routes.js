import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { getAvailableAppointments ,reserveAppointment} from "../controllers/available-appointment.controller.js";

import { getAvailableAppointmentsQuerySchema ,appointmentIdSchema} from "../validators/available-appointment.validator.js";

const router = express.Router();

// Get available appointments


/**git 
 * @swagger
 * /available-appointments:
 *   get:
 *     summary: Get available appointments for patients
 *     tags: [Available Appointments]
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
 *     responses:
 *       200:
 *         description: Available appointments retrieved successfully
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
    validate(getAvailableAppointmentsQuerySchema, "query"),
    getAvailableAppointments,
  );

  
/**
 * @swagger
 * /available-appointments/{appointmentId}/reserve:
 *   post:
 *     summary: Reserve an available appointment
 *     tags: [Available Appointments]
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
 *         description: Appointment reserved successfully
 *       400:
 *         description: Invalid appointment ID or reservation request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - patient role required
 *       404:
 *         description: Appointment not found
 */

  router
  .route("/:appointmentId/reserve")
  .post(
    auth,
    roleGuard("patient"),
    validate(appointmentIdSchema, "params"),
    reserveAppointment,
  );


export default router;
