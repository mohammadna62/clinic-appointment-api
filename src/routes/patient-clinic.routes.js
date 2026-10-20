import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { getActiveClinics } from "../controllers/clinic.controller.js";
import {getActiveDoctorsByClinic} from "./../controllers/doctor.controller.js"

import { paginationSchema } from "../validators/pagination.validator.js";

import {clinicIdSchema} from "./../validators/doctor.validator.js"

const router = express.Router();


/**
 * @swagger
 * /clinics:
 *   get:
 *     summary: Get active clinics
 *     description: Returns a paginated list of active clinics for authenticated patients.
 *     tags: [Clinics]
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
 *         description: Active clinics retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Patient access required
 *       500:
 *         description: Internal server error
 */

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(paginationSchema, "query"),
    getActiveClinics,
  );

  
/**
 * @swagger
 * /clinics/{clinicId}/doctors:
 *   get:
 *     summary: Get doctors by clinic
 *     description: Returns a paginated list of doctors associated with the specified clinic for authenticated patients.
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Clinic MongoDB ObjectId
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
 *         description: Doctors retrieved successfully
 *       400:
 *         description: Invalid clinic ID or pagination parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Patient access required
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 */

router
  .route("/:clinicId/doctors")
  .get(
    auth,
    roleGuard("patient"),
    validate(clinicIdSchema, "params"),
    validate(paginationSchema, "query"),
    getActiveDoctorsByClinic,
  );
export default router;
