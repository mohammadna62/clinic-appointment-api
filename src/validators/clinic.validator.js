import { z } from "zod";
import mongoose from "mongoose";

export const createClinicSchema = z.object({
  name: z.string().trim().min(2, "Clinic name must be at least 2 characters"),

  description: z.string().trim().optional(),
}).strict();

export const clinicIdSchema = z
  .object({
    clinicId: z.string().refine((value) => mongoose.isValidObjectId(value), {
      message: "Invalid clinic ID",
    }),
  })
  .strict();
export const updateClinicSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateClinicStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();