import express from "express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  updateClinicStatus,
} from "./../controllers/clinic.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import {
  createClinicSchema,
  clinicIdSchema,
  updateClinicSchema,
  updateClinicStatusSchema,
} from "./../validators/clinic.validator.js";
import { paginationSchema } from "../validators/pagination.validator.js";

const router = express.Router();

/**
 * @swagger
 * /admin/clinics:
 *   post:
 *     summary: Create a clinic
 *     description: Creates a new clinic. Accessible to administrators only.
 *     tags: [Clinics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClinicRequest'
 *     responses:
 *       201:
 *         description: Clinic created successfully
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     summary: Get clinics
 *     description: Returns a paginated list of clinics. Accessible to administrators only.
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
 *         description: Clinics retrieved successfully
 *       400:
 *         description: Invalid pagination parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       500:
 *         description: Internal server error
 */
router
  .route("/")
  .post(
    auth,
    roleGuard("admin"),
    validate(createClinicSchema, "body"),
    createClinic,
  )
  .get(
    auth,
    roleGuard("admin"),
    validate(paginationSchema, "query"),
    getClinics,
  );

/**
 * @swagger
 * /admin/clinics/{clinicId}:
 *   get:
 *     summary: Get clinic details
 *     description: Retrieves a clinic by its ID. Accessible to administrators only.
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
 *     responses:
 *       200:
 *         description: Clinic retrieved successfully
 *       400:
 *         description: Invalid clinic ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 *
 *   patch:
 *     summary: Update a clinic
 *     description: Updates clinic information. Accessible to administrators only.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClinicRequest'
 *     responses:
 *       200:
 *         description: Clinic updated successfully
 *       400:
 *         description: Invalid clinic ID or request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/:clinicId")
  .get(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    getClinicById,
  )
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    validate(updateClinicSchema, "body"),
    updateClinic,
  );

/**
 * @swagger
 * /admin/clinics/{clinicId}/status:
 *   patch:
 *     summary: Update clinic status
 *     description: Updates whether a clinic is active. Accessible to administrators only.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateClinicStatusRequest'
 *     responses:
 *       200:
 *         description: Clinic status updated successfully
 *       400:
 *         description: Invalid clinic ID or status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Administrator access required
 *       404:
 *         description: Clinic not found
 *       500:
 *         description: Internal server error
 */
router
  .route("/:clinicId/status")
  .patch(
    auth,
    roleGuard("admin"),
    validate(clinicIdSchema, "params"),
    validate(updateClinicStatusSchema, "body"),
    updateClinicStatus,
  );

export default router;
