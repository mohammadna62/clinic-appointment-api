
import { describe, it, expect } from "vitest";

import {
  bookingIdPaymentSchema,
  paymentIdSchema,
  adminPaymentQuerySchema,
} from "../src/validators/payment.validator.js";

describe("bookingIdPaymentSchema", () => {
  it("should accept a valid booking ID", () => {
    const result = bookingIdPaymentSchema.safeParse({
      bookingId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid booking ID", () => {
    const result = bookingIdPaymentSchema.safeParse({
      bookingId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = bookingIdPaymentSchema.safeParse({
      bookingId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing booking ID", () => {
    const result = bookingIdPaymentSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("paymentIdSchema", () => {
  it("should accept a valid payment ID", () => {
    const result = paymentIdSchema.safeParse({
      paymentId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid payment ID", () => {
    const result = paymentIdSchema.safeParse({
      paymentId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = paymentIdSchema.safeParse({
      paymentId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing payment ID", () => {
    const result = paymentIdSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("adminPaymentQuerySchema", () => {
  it("should apply default pagination values", () => {
    const result = adminPaymentQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should coerce string pagination values to numbers", () => {
    const result = adminPaymentQuerySchema.safeParse({
      page: "2",
      limit: "50",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it.each(["pending", "paid", "failed", "refunded"])(
    "should accept payment status '%s'",
    (status) => {
      const result = adminPaymentQuerySchema.safeParse({ status });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe(status);
      }
    },
  );

  it("should reject an invalid payment status", () => {
    const result = adminPaymentQuerySchema.safeParse({
      status: "cancelled",
    });

    expect(result.success).toBe(false);
  });

  it("should reject page values below 1", () => {
    const result = adminPaymentQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject non-integer page values", () => {
    const result = adminPaymentQuerySchema.safeParse({
      page: "1.5",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values below 1", () => {
    const result = adminPaymentQuerySchema.safeParse({
      limit: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values above 100", () => {
    const result = adminPaymentQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown query parameters", () => {
    const result = adminPaymentQuerySchema.safeParse({
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
