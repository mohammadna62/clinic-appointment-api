import express from "express";
import { sentOtp, verifyOtp } from "./../controllers/auth.controller.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.js";
import validate from "../validators/validate.middleware.js";

const router = express.Router();

router.route("/send-otp").post(validate(sendOtpSchema), sentOtp);

router.route("/verify-otp").post(validate(verifyOtpSchema), verifyOtp);

export default router;
