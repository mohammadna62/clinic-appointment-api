import { z } from "zod";
import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const weeklyScheduleClinicIdSchema = z
  .object({
    clinicId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid clinic ID",
      },
    ),
  })
  .strict();

export const weeklyScheduleIdSchema = z
  .object({
    clinicId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid clinic ID",
      },
    ),

    scheduleId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid schedule ID",
      },
    ),
  })
  .strict();

export const createWeeklyScheduleSchema = z
  .object({
    dayOfWeek: z.coerce.number().int().min(0).max(6),

    isActive: z.boolean().optional(),

    morningStart: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .optional(),

    morningEnd: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .optional(),

    eveningStart: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .optional(),

    eveningEnd: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .optional(),
  })
  .strict();

export const updateWeeklyScheduleSchema = z
  .object({
    isActive: z.boolean().optional(),

    morningStart: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .nullable()
      .optional(),

    morningEnd: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .nullable()
      .optional(),

    eveningStart: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .nullable()
      .optional(),

    eveningEnd: z
      .string()
      .regex(timeRegex, "Invalid time format")
      .nullable()
      .optional(),
  })
  .strict();