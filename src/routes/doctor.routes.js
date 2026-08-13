import express from "express";
import auth from "./../middlewares/auth.middleware.js";
import roleGuard from "./../middlewares/roleGuard.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createDoctor } from "../controllers/doctor.controller.js";
import {createDoctorSchema} from "./../validators/doctor.validator.js"


const router = express.Router();

router
  .route("/")
  .post(auth, roleGuard("patient"), validate(createDoctorSchema), createDoctor);

export default router;
