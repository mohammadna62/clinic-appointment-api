
import { describe, it, expect } from "vitest";

import {
  createRatingSchema,
  ratingIdSchema,
  doctorRatingParamsSchema,
} from "../src/validators/rating.validator.js";

describe("createRatingSchema", () => {
  it("should accept valid rating data", () => {
    const result = createRatingSchema.safeParse({
      rating: 5,
      comment: "Excellent doctor",
    });

    expect(result.success).toBe(true);
  });

  it("should accept the minimum rating of 1", () => {
    const result = createRatingSchema.safeParse({
      rating: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should accept the maximum rating of 5", () => {
    const result = createRatingSchema.safeParse({
      rating: 5,
    });

    expect(result.success).toBe(true);
  });

  it("should reject a rating below 1", () => {
    const result = createRatingSchema.safeParse({
      rating: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a rating above 5", () => {
    const result = createRatingSchema.safeParse({
      rating: 6,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-integer rating", () => {
    const result = createRatingSchema.safeParse({
      rating: 4.5,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a string instead of a number", () => {
    const result = createRatingSchema.safeParse({
      rating: "5",
    });

    expect(result.success).toBe(false);
  });

  it("should trim whitespace from the comment", () => {
    const result = createRatingSchema.safeParse({
      rating: 4,
      comment: "  Very good  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.comment).toBe("Very good");
    }
  });

  it("should default the comment to an empty string", () => {
    const result = createRatingSchema.safeParse({
      rating: 5,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.comment).toBe("");
    }
  });

  it("should reject a comment longer than 1000 characters", () => {
    const result = createRatingSchema.safeParse({
      rating: 5,
      comment: "A".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = createRatingSchema.safeParse({
      rating: 5,
      comment: "Excellent",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("ratingIdSchema", () => {
  it("should accept a valid 24-character hexadecimal ID", () => {
    const result = ratingIdSchema.safeParse({
      ratingId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid rating ID", () => {
    const result = ratingIdSchema.safeParse({
      ratingId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an ID containing non-hexadecimal characters", () => {
    const result = ratingIdSchema.safeParse({
      ratingId: "507f1f77bcf86cd79943901g",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = ratingIdSchema.safeParse({
      ratingId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("doctorRatingParamsSchema", () => {
  it("should accept a valid doctor ID", () => {
    const result = doctorRatingParamsSchema.safeParse({
      doctorId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid doctor ID", () => {
    const result = doctorRatingParamsSchema.safeParse({
      doctorId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an ID containing non-hexadecimal characters", () => {
    const result = doctorRatingParamsSchema.safeParse({
      doctorId: "507f1f77bcf86cd79943901g",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = doctorRatingParamsSchema.safeParse({
      doctorId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

