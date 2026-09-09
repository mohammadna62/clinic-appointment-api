import { z } from "zod";
import mongoose from "mongoose";

export const appointmentIdBookingSchema = z
  .object({
    appointmentId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid appointment ID",
      },
    ),
  })
  .strict();