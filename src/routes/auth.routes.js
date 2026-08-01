import express from "express";
import { sentOtp, verifyOtp } from "./../controllers/auth.controller.js";
const router = express.Router();

router.route("/send-otp").post(sentOtp);

router.route("/verify-otp").post(verifyOtp);

export default router;
