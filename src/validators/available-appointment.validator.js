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