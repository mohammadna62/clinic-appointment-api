import AppError from "../errors/app-error.js";
import { successResponse } from "../helpers/response.js";
import {
  sendOtp,
  verifyOtp as verifyOtpService,
  refreshToken as refreshTokenService,
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

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return successResponse(res, {
      message: "User profile fetch successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const {refreshToken}  = req.body

    const tokens = await refreshTokenService(refreshToken);

    return successResponse(res,{
      message:"Token refreshed successfully",
      data:tokens
    })

  } catch (error) {
    next(error);
  }
};
