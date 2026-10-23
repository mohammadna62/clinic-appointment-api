import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createPayment,
  zarinpalCallback,
} from "../controllers/payment.controller.js";

import {
  bookingIdPaymentSchema,
} from "../validators/payment.validator.js";

const router = express.Router();


/**
 * @swagger
 * /payments/zarinpal/callback:
 *   get:
 *     summary: Handle Zarinpal payment callback
 *     description: Processes the callback from Zarinpal and verifies the payment result.
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: Authority
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment authority returned by Zarinpal
 *       - in: query
 *         name: Status
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment status returned by Zarinpal
 *     responses:
 *       200:
 *         description: Payment verified successfully, or payment was already verified
 *       400:
 *         description: Invalid callback parameters or payment verification failed
 *       404:
 *         description: Payment request not found
 */

router
  .route("/zarinpal/callback")
  .get(
    zarinpalCallback,
  );

  
/**
 * @swagger
 * /payments/{bookingId}:
 *   post:
 *     summary: Create a payment request
 *     description: Creates a payment request for a booking belonging to the authenticated patient.
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB booking ID
 *     responses:
 *       201:
 *         description: Payment request created successfully
 *       400:
 *         description: Invalid booking ID or invalid request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Payment request conflicts with the current booking or payment state
 */
router
  .route("/:bookingId")
  .post(
    auth,
    roleGuard("patient"),
    validate(bookingIdPaymentSchema, "params"),
    createPayment,
  );

export default router;