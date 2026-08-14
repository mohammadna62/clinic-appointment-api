import { z } from "zod";

export const createClinicSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Clinic name must be at least 2 characters"),

  description: z
    .string()
    .trim()
    .optional(),
});