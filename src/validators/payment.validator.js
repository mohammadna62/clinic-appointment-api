import { z } from "zod";
import mongoose from "mongoose";

export const bookingIdPaymentSchema = z
  .object({
    bookingId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: "Invalid booking ID",
    }),
  })
  .strict();
export const paymentIdSchema = z
  .object({
    paymentId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: "Invalid payment ID",
    }),
  })
  .strict();
export const adminPaymentQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),

    status: z.enum(["pending", "paid", "failed"]).optional(),
  })
  .strict();
