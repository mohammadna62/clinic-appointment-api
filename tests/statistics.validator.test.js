
import { describe, it, expect } from "vitest";

import {
  statisticsQuerySchema,
} from "../src/validators/statistics.validator.js";

describe("statisticsQuerySchema", () => {
  it("should apply the default period of month", () => {
    const result = statisticsQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.period).toBe("month");
    }
  });

  it.each([
    "day",
    "week",
    "month",
    "3months",
    "6months",
    "year",
    "5years",
  ])("should accept the period '%s'", (period) => {
    const result = statisticsQuerySchema.safeParse({ period });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.period).toBe(period);
    }
  });

  it("should reject an invalid period", () => {
    const result = statisticsQuerySchema.safeParse({
      period: "2weeks",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty period", () => {
    const result = statisticsQuerySchema.safeParse({
      period: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown query parameters", () => {
    const result = statisticsQuerySchema.safeParse({
      period: "month",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
