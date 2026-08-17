import { z } from "zod";
import mongoose from "mongoose";

export const getUsersQuerySchema = z.object({
  status: z.enum(["active", "banned", "deleted"]).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const userIdSchema = z
  .object({
    userId: z.string().refine(
      (value) => mongoose.isValidObjectId(value),
      {
        message: "Invalid user ID",
      },
    ),
  })
  .strict();