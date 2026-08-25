import { z } from "zod";
import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const clinicTimePolicyClinicIdSchema = z
  .object({
    clinicId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid clinic ID",
      },
    ),
  })
  .strict();

export const createClinicTimePolicySchema = z
  .object({
    morningStart: z.string().regex(timeRegex, "Invalid time format"),
    morningEnd: z.string().regex(timeRegex, "Invalid time format"),

    eveningStart: z.string().regex(timeRegex, "Invalid time format"),
    eveningEnd: z.string().regex(timeRegex, "Invalid time format"),

    appointmentDuration: z.coerce
      .number()
      .int()
      .min(5)
      .max(180),
  })
  .strict();

export const updateClinicTimePolicySchema = z
  .object({
    morningStart: z.string().regex(timeRegex, "Invalid time format").optional(),

    morningEnd: z.string().regex(timeRegex, "Invalid time format").optional(),

    eveningStart: z.string().regex(timeRegex, "Invalid time format").optional(),

    eveningEnd: z.string().regex(timeRegex, "Invalid time format").optional(),

    appointmentDuration: z.coerce
      .number()
      .int()
      .min(5)
      .max(180)
      .optional(),
  })
  .strict();