import { z } from "zod";

export const statisticsQuerySchema = z
  .object({
    period: z
      .enum(["day", "week", "month", "3months", "6months", "year"])
      .default("month"),
  })
  .strict();
