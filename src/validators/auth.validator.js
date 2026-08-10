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

export const completeProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),

  nationalCode: z
    .string()
    .regex(/^\d{10}$/, " National code must be 10 digits"),
}).strict();

export const updateProfileSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name is too long")
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name is too long")
      .optional(),

    nationalCode: z
      .string()
      .regex(/^\d{10}$/, "National code must be 10 digits")
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.firstName !== undefined ||
      data.lastName !== undefined ||
      data.nationalCode !== undefined,
    {
      message: "At least one profile field is required",
    },
  );