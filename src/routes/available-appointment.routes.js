import express from "express";

import auth from "../middlewares/auth.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import { getAvailableAppointments ,reserveAppointment} from "../controllers/available-appointment.controller.js";

import { getAvailableAppointmentsQuerySchema ,appointmentIdSchema} from "../validators/available-appointment.validator.js";

const router = express.Router();

// Get available appointments

router
  .route("/")
  .get(
    auth,
    roleGuard("patient"),
    validate(getAvailableAppointmentsQuerySchema, "query"),
    getAvailableAppointments,
  );
  router
  .route("/:appointmentId/reserve")
  .patch(
    auth,
    roleGuard("patient"),
    validate(appointmentIdSchema, "params"),
    reserveAppointment,
  );


export default router;
