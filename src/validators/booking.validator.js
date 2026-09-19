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
    bookingId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid booking ID",
      },
    ),
  })
  .strict();