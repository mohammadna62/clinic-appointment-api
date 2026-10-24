
import { describe, it, expect } from "vitest";

import {
  clinicTimePolicyClinicIdSchema,
  createClinicTimePolicySchema,
  updateClinicTimePolicySchema,
} from "../src/validators/clinic-time-policy.validator.js";

describe("clinicTimePolicyClinicIdSchema", () => {
  it("should accept a valid clinic ID", () => {
    const result = clinicTimePolicyClinicIdSchema.safeParse({
      clinicId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid clinic ID", () => {
    const result = clinicTimePolicyClinicIdSchema.safeParse({
      clinicId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = clinicTimePolicyClinicIdSchema.safeParse({
      clinicId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("createClinicTimePolicySchema", () => {
  const validPolicy = {
    morningStart: "08:00",
    morningEnd: "12:00",
    eveningStart: "16:00",
    eveningEnd: "20:00",
    appointmentDuration: 30,
  };

  it("should accept valid time policy data", () => {
    const result = createClinicTimePolicySchema.safeParse(validPolicy);

    expect(result.success).toBe(true);
  });

  it("should coerce appointmentDuration from string to number", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: "30",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.appointmentDuration).toBe(30);
    }
  });

  it("should accept the minimum appointment duration of 5 minutes", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: 5,
    });

    expect(result.success).toBe(true);
  });

  it("should accept the maximum appointment duration of 180 minutes", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: 180,
    });

    expect(result.success).toBe(true);
  });

  it("should reject an appointment duration below 5 minutes", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: 4,
    });

    expect(result.success).toBe(false);
  });

  it("should reject an appointment duration above 180 minutes", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: 181,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-integer appointment duration", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      appointmentDuration: 30.5,
    });

    expect(result.success).toBe(false);
  });

  it.each([
    "8:00",
    "24:00",
    "12:60",
    "-1:00",
    "12:00 PM",
    "invalid",
  ])("should reject the invalid time '%s'", (time) => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      morningStart: time,
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = createClinicTimePolicySchema.safeParse({
      morningStart: "08:00",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = createClinicTimePolicySchema.safeParse({
      ...validPolicy,
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateClinicTimePolicySchema", () => {
  it("should accept an empty object because all fields are optional", () => {
    const result = updateClinicTimePolicySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should accept updating only one time field", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      morningStart: "09:00",
    });

    expect(result.success).toBe(true);
  });

  it("should accept updating only appointment duration", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      appointmentDuration: 45,
    });

    expect(result.success).toBe(true);
  });

  it("should coerce appointmentDuration from string to number", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      appointmentDuration: "45",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.appointmentDuration).toBe(45);
    }
  });

  it("should reject an invalid time format", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      eveningStart: "25:00",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an appointment duration below 5 minutes", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      appointmentDuration: 4,
    });

    expect(result.success).toBe(false);
  });

  it("should reject an appointment duration above 180 minutes", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      appointmentDuration: 181,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a non-integer appointment duration", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      appointmentDuration: 15.5,
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateClinicTimePolicySchema.safeParse({
      morningStart: "09:00",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
