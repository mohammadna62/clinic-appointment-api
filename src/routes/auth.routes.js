import express from "express";
import { sentOtp, verifyOtp, getMe } from "./../controllers/auth.controller.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validators/auth.validator.js";
import validate from "../middlewares/validate.middleware.js";
import auth from "./../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/send-otp").post(validate(sendOtpSchema), sentOtp);

router.route("/verify-otp").post(validate(verifyOtpSchema), verifyOtp);

router.route("/me").get(auth,getMe)

export default router;
