import { successResponse } from "../helpers/response.js";
import {
  sendOtp,
  verifyOtp as verifyOtpService,
} from "../services/auth.service.js";
import User from "./../models/user.model.js";

export const sentOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    await sendOtp(phone);

    return successResponse(res, {
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const { user, refreshToken, accessToken } = await verifyOtpService(
      phone,
      otp,
    );

    return successResponse(res, {
      message: "OTP verified successfully",
      data: {
        user,
        accessToken,
        refreshToken,
        profileCompleted: Boolean(
          user.firstName && user.lastName && user.nationalCode,
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};
