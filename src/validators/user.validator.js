import { z } from "zod";

export const getUsersQuerySchema = z.object({
  status: z.enum(["active", "banned", "deleted"]).optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),
});