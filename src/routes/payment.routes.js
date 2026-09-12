import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
  createPayment,
} from "../controllers/payment.controller.js";

import {
  bookingIdPaymentSchema,
} from "../validators/payment.validator.js";

const router = express.Router();

router
  .route("/:bookingId")
  .post(
    auth,
    roleGuard("patient"),
    validate(bookingIdPaymentSchema, "params"),
    createPayment,
  );

export default router;