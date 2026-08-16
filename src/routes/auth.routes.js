import express from "express";
import { sentOtp, verifyOtp, getMe,refreshToken,completeProfile, logout,} from "./../controllers/auth.controller.js";
import {
  refreshTokenSchema,
  sendOtpSchema,
  verifyOtpSchema,
  completeProfileSchema,
  
} from "../validators/auth.validator.js";
import validate from "../middlewares/validate.middleware.js";
import auth from "./../middlewares/auth.middleware.js"

const router = express.Router();

router.route("/send-otp").post(validate(sendOtpSchema, "body"), sentOtp);

router.route("/verify-otp").post(validate(verifyOtpSchema, "body"), verifyOtp);

router.route("/me").get(auth,getMe)

router.route("/refresh-token").post(validate(refreshTokenSchema, "body"),refreshToken)

router.route("/profile/complete").patch(auth,validate(completeProfileSchema, "body"),completeProfile)

router.route("/logout").post(auth,logout)

export default router;
