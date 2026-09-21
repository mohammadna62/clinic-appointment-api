import { z } from "zod";
import mongoose from "mongoose";

export const appointmentIdBookingSchema = z
  .object({
    appointmentId: z
      .string()
      .refine((value) => mongoose.isValidObjectId(value), {
        message: "Invalid appointment ID",
      }),
  })
  .strict();

export const bookingIdSchema = z
  .object({
    bookingId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: "Invalid booking ID",
    }),
  })
  .strict();
export const adminBookingQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    status: z
      .enum([
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "patient_no_show",
      ])
      .optional(),
  })
  .strict();
