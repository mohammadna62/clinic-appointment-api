
import { describe, it, expect } from "vitest";

import {
  appointmentIdBookingSchema,
  bookingIdSchema,
  adminBookingQuerySchema,
} from "../src/validators/booking.validator.js";

describe("appointmentIdBookingSchema", () => {
  it("should accept a valid appointment ID", () => {
    const result = appointmentIdBookingSchema.safeParse({
      appointmentId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid appointment ID", () => {
    const result = appointmentIdBookingSchema.safeParse({
      appointmentId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = appointmentIdBookingSchema.safeParse({
      appointmentId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("bookingIdSchema", () => {
  it("should accept a valid booking ID", () => {
    const result = bookingIdSchema.safeParse({
      bookingId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid booking ID", () => {
    const result = bookingIdSchema.safeParse({
      bookingId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = bookingIdSchema.safeParse({
      bookingId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("adminBookingQuerySchema", () => {
  it("should apply default pagination values", () => {
    const result = adminBookingQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should coerce string pagination values to numbers", () => {
    const result = adminBookingQuerySchema.safeParse({
      page: "2",
      limit: "50",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it.each([
    "pending",
    "confirmed",
    "cancelled",
    "completed",
    "patient_no_show",
  ])("should accept the status '%s'", (status) => {
    const result = adminBookingQuerySchema.safeParse({ status });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.status).toBe(status);
    }
  });

  it("should reject an invalid booking status", () => {
    const result = adminBookingQuerySchema.safeParse({
      status: "invalid-status",
    });

    expect(result.success).toBe(false);
  });

  it("should reject page values below 1", () => {
    const result = adminBookingQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values above 100", () => {
    const result = adminBookingQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown query parameters", () => {
    const result = adminBookingQuerySchema.safeParse({
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
