import express from "express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import {
  createClinic,
  getClinics,
} from "./../controllers/clinic.controller.js";
import validate from "./../middlewares/validate.middleware.js";
import { createClinicSchema } from "./../validators/clinic.validator.js";

const router = express.Router();

router
  .route("/")
  .post(auth, roleGuard("admin"), validate(createClinicSchema), createClinic)
  .get(auth, roleGuard("admin"), getClinics);

export default router;
