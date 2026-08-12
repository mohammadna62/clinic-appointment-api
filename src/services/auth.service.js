import bcrypt from "bcrypt";

import User from "./../models/user.model.js";
import AppError from "./../errors/app-error.js";
import { generateOtp } from "../utils/otp.util.js";
import { sendSms } from "./sms.service.js";
import { redis } from "../config/redis.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "./../utils/jwt.util.js";
import env from "./../config/env.js";
import { hashToken, compareToken } from "./../utils/hash.util.js";

export async function sendOtp(phone) {
  const user = await User.findOne({ phone });

  if (user?.isBanned) {
    throw new AppError("User is banned", 403);
  }

  const otp = generateOtp();

  const hashedOtp = await bcrypt.hash(otp, 12);

  const redisKey = `auth:otp:${phone}`;

  await redis.set(redisKey, hashedOtp, "EX", env.OTP_EXPIRE_SECONDS);

  await sendSms(phone, otp);
}

export async function verifyOtp(phone, otp) {
  let user = await User.findOne({ phone });

  if (user?.isBanned) {
    throw new AppError("User is banned", 403);
  }

  const redisKey = `auth:otp:${phone}`;

  const hashedOtp = await redis.get(redisKey);

  if (!hashedOtp) {
    throw new AppError("OTP has expired or is invalid", 400);
  }
  const isValidOtp = await bcrypt.compare(otp, hashedOtp);

  if (!isValidOtp) {
    throw new AppError("Invalid OTP", 400);
  }
  await redis.del(redisKey);

  if (!user) {
    const usersCount = await User.countDocuments();

    const role = usersCount === 0 ? "admin" : "patient";

    user = await User.create({
      phone,
      role,
      isVerified: true,
    });
  } else if (user.isDeleted) {
    user.isDeleted = false;
    user.deletedAt = null;
    user.isVerified = true;

    await user.save();
  }
  const payload = {
    userId: user._id,
    role: user.role,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const refreshKey = `auth:refresh:${user._id}`;

  const hashedRefreshToken = hashToken(refreshToken);

  await redis.set(
    refreshKey,
    hashedRefreshToken,
    "EX",
    env.REFRESH_TOKEN_EXPIRE_SECONDS,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function refreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);

  const user = await User.findById(payload.userId);
  if (!user) {
    throw new AppError("User not found", 401);
  }
  if (user.isBanned) {
    throw new AppError("User is banned", 403);
  }
  if (user.isDeleted) {
    throw new AppError("User account has been deleted", 403);
  }

  const refreshKey = `auth:refresh:${payload.userId}`;

  const hashedToken = await redis.get(refreshKey);

  if (!hashedToken) {
    throw new AppError("Refresh token expired", 401);
  }

  const isValid = compareToken(refreshToken, hashedToken);

  if (!isValid) {
    throw new AppError("Invalid refresh token", 401);
  }

  const newPayload = {
    userId: payload.userId,
    role: payload.role,
  };

  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  const newRefreshKey = `auth:refresh:${payload.userId}`;

  const hashedRefreshToken = hashToken(newRefreshToken);

  await redis.set(
    newRefreshKey,
    hashedRefreshToken,
    "EX",
    env.REFRESH_TOKEN_EXPIRE_SECONDS,
  );
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function completeProfile(userId, data) {
  const { firstName, lastName, nationalCode } = data;

  const existingUser = await User.findOne({
    nationalCode,
    _id: { $ne: userId },
  });

  if (existingUser) {
    throw new AppError("National code is already in use", 409);
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      firstName,
      lastName,
      nationalCode,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function logout(userId) {
  const refreshKey = `auth:refresh:${userId}`;

  await redis.del(refreshKey);
}
