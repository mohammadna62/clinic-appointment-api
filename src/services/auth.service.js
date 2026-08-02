import bcrypt from "bcrypt";

import User from "./../models/user.model.js";
import AppError from "./../errors/app-error.js";
import { generateOtp } from "../utils/otp.util.js";
import { sendSms } from "./sms.service.js";
import { redis } from "../config/redis.js";
import env from "./../config/env.js";

export async function sendOtp(phone) {
  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 12);

  const redisKey = `auth:otp:${phone}`;

  await redis.set(redisKey, hashedOtp, "EX", env.OTP_EXPIRE_SECONDS);

  await sendSms(phone, otp);
}

export async function verifyOtp(phone, otp) {
  const redisKey = `auth:otp:${phone}`;

  const hashedOtp = await redis.get(redisKey);

  if (!hashedOtp) {
    throw new AppError("OTP has expired or is invalid", 400);
  }
  const isValidOtp =await bcrypt.compare(otp, hashedOtp);

  if (!isValidOtp) {
    throw new AppError("Invalid OTP", 400);
  }
  await redis.del(redisKey);

  let user = await User.findOne({ phone });

  if (!user) {
    user = await User.create({
      phone,
      isVerified: true,
    });
  }
  return user;
}
