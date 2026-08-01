import { z } from "zod";

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(10, "Phone number is invalid")
    .max(15, "Phone number is invalid"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
