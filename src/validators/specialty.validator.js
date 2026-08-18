import { z } from "zod";
import mongoose from "mongoose";

export const createSpecialtySchema = z
  .object({
    name: z.string().trim().min(2).max(100),

    description: z.string().trim().max(500).optional(),
  })
  .strict();

export const updateSpecialtySchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),

    description: z.string().trim().max(500).optional(),

    isActive: z.boolean().optional(),
  })
  .strict();

export const specialtyIdSchema = z
  .object({
    specialtyId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid specialty ID",
      },
    ),
  })
  .strict();