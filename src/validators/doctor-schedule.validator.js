import { z } from "zod";
import mongoose from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const doctorIdScheduleSchema = z
  .object({
    doctorId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid doctor ID",
      },
    ),
  })
  .strict();

export const doctorScheduleParamsSchema = z
  .object({
    doctorId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid doctor ID",
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

export const createDoctorScheduleSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0)
      .max(6),

    startTime: z
      .string()
      .regex(timeRegex, "Invalid start time"),

    endTime: z
      .string()
      .regex(timeRegex, "Invalid end time"),
  })
  .strict()
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: "Start time must be before end time",
      path: ["startTime"],
    },
  );

export const updateDoctorScheduleSchema = z
  .object({
    startTime: z
      .string()
      .regex(timeRegex, "Invalid start time")
      .optional(),

    endTime: z
      .string()
      .regex(timeRegex, "Invalid end time")
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.startTime !== undefined ||
      data.endTime !== undefined ||
      data.isActive !== undefined,
    {
      message: "At least one schedule field is required",
    },
  )
  .refine(
    (data) =>
      data.startTime === undefined ||
      data.endTime === undefined ||
      data.startTime < data.endTime,
    {
      message: "Start time must be before end time",
      path: ["startTime"],
    },
  );