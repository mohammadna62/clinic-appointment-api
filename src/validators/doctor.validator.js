import z from "zod"

export const createDoctorSchema = z.object({
  medicalCode: z
    .string()
    .trim()
    .min(2, "Medical Code  must be at least 2 characters")
    .max(10, "Medical Code  is too long"),
  bio: z
    .string()
    .trim()
    .min(2, "Biography must be at least 2 characters")
    .max(1000, "Biography  is too long")
    .optional(),
});
