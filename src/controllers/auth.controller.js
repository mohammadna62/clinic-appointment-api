import { successResponse } from "../helpers/response.js";
import User from "./../models/user.model.js";

export const sentOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    //TODO -> Generate OTP -> Save OTP in Redis -> send SMS

    return successResponse(res, {
      
      message: "OTP sent successfully",
      data: {
        phone,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    //TODO verify OTP from Redis

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({ phone, isVerified: true });
      
    }
    return successResponse(res , {
        message:"OTP verified successfully",
        data:{
            user,
            profileCompleted:Boolean(
                user.firstName &&
                user.lastName && 
                user.nationalCode
            )
        }
    })
  } catch (error) {
    next(error);
  }
};
