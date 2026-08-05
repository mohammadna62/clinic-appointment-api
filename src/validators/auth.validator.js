import { z } from "zod";

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "Phone number is invalid"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^09\d{9}$/, "Phone number is invalid"),

  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
