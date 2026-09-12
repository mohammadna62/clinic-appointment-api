import { z } from "zod";
import mongoose from "mongoose";

export const bookingIdPaymentSchema = z
  .object({
    bookingId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: "Invalid booking ID",
    }),
  })
  .strict();
