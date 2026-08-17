import { z } from "zod";

export const createDoctorSchema = z
  .object({
    clinic: z.string().min(1, "Clinic ID is required"),

    specialty: z.string().min(1, "Specialty ID is required"),

    medicalCode: z.string().trim().min(1, "Medical code is required"),

    bio: z.string().trim().max(1000).optional(),
  })
  .strict();