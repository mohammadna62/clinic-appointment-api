
import { describe, it, expect } from "vitest";

import {
  paginationSchema,
} from "../src/validators/pagination.validator.js";

describe("paginationSchema", () => {
  it("should apply default pagination values", () => {
    const result = paginationSchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should coerce string values to numbers", () => {
    const result = paginationSchema.safeParse({
      page: "2",
      limit: "25",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("should accept the minimum valid page and limit", () => {
    const result = paginationSchema.safeParse({
      page: 1,
      limit: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should accept the maximum valid limit", () => {
    const result = paginationSchema.safeParse({
      page: 1,
      limit: 100,
    });

    expect(result.success).toBe(true);
  });

  it("should reject a page value below 1", () => {
    const result = paginationSchema.safeParse({
      page: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a negative page value", () => {
    const result = paginationSchema.safeParse({
      page: -1,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-integer page value", () => {
    const result = paginationSchema.safeParse({
      page: 1.5,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a limit value below 1", () => {
    const result = paginationSchema.safeParse({
      limit: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a limit value above 100", () => {
    const result = paginationSchema.safeParse({
      limit: 101,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-integer limit value", () => {
    const result = paginationSchema.safeParse({
      limit: 10.5,
    });

    expect(result.success).toBe(false);
  });

  it("should remove unknown fields from the parsed result", () => {
    const result = paginationSchema.safeParse({
      page: 2,
      limit: 20,
      extraField: "unexpected",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});
