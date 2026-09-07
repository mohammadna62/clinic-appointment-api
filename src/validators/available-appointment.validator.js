import { z } from "zod";
import mongoose from "mongoose";

export const doctorIdAppointmentSchema = z
  .object({
    doctorId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid doctor ID",
      },
    ),
  })
  .strict();

  export const generateAppointmentForDateSchema = z
  .object({
    date: z.coerce.date(),
  })
  .strict();
  export const getAvailableAppointmentsQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();