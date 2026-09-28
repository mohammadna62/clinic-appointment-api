import { z } from "zod";

export const createRatingSchema = z
  .object({
    rating: z.number().int().min(1).max(5),

    comment: z.string().trim().max(1000).optional().default(""),
  })
  .strict();

export const ratingIdSchema = z
  .object({
    ratingId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid rating ID"),
  })
  .strict();

export const doctorRatingParamsSchema = z
  .object({
    doctorId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid doctor ID"),
  })
  .strict();
