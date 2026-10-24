
import { describe, it, expect } from "vitest";

import {
  getUsersQuerySchema,
  userIdSchema,
} from "../src/validators/user.validator.js";

describe("getUsersQuerySchema", () => {
  it("should apply default pagination values", () => {
    const result = getUsersQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should coerce string pagination values to numbers", () => {
    const result = getUsersQuerySchema.safeParse({
      page: "2",
      limit: "50",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it.each(["active", "banned", "deleted"])(
    "should accept status '%s'",
    (status) => {
      const result = getUsersQuerySchema.safeParse({ status });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe(status);
      }
    },
  );

  it("should reject an invalid status", () => {
    const result = getUsersQuerySchema.safeParse({
      status: "suspended",
    });

    expect(result.success).toBe(false);
  });

  it("should reject page values below 1", () => {
    const result = getUsersQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values below 1", () => {
    const result = getUsersQuerySchema.safeParse({
      limit: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values above 100", () => {
    const result = getUsersQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("should remove unknown query parameters from the parsed result", () => {
    const result = getUsersQuerySchema.safeParse({
      status: "active",
      extraField: "unexpected",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
  });
});

describe("userIdSchema", () => {
  it("should accept a valid user ID", () => {
    const result = userIdSchema.safeParse({
      userId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid user ID", () => {
    const result = userIdSchema.safeParse({
      userId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = userIdSchema.safeParse({
      userId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing user ID", () => {
    const result = userIdSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});
