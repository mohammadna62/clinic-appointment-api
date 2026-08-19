import { z } from "zod";
import mongoose from "mongoose";

export const createDoctorSchema = z
  .object({
    clinic: z.string().min(1, "Clinic ID is required"),

    specialty: z.string().min(1, "Specialty ID is required"),

    medicalCode: z.string().trim().min(1, "Medical code is required"),

    bio: z.string().trim().max(1000).optional(),
  })
  .strict();

export const doctorIdSchema = z
  .object({
    doctorId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid doctor ID",
      },
    ),
  })
  .strict();

export const updateDoctorSchema = z
  .object({
    clinic: z.string().min(1).optional(),

    specialty: z.string().min(1).optional(),

    medicalCode: z.string().trim().min(1).optional(),

    bio: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateDoctorStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();