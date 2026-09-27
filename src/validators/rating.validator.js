import { z } from "zod";

export const createRatingSchema = z
  .object({
    rating: z.number().int().min(1).max(5),

    comment: z.string().trim().max(1000).optional().default(""),
  })
  .strict();
