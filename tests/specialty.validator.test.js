
import { describe, it, expect } from "vitest";

import {
  createSpecialtySchema,
  updateSpecialtySchema,
  specialtyIdSchema,
} from "../src/validators/specialty.validator.js";

describe("createSpecialtySchema", () => {
  it("should accept valid specialty data", () => {
    const result = createSpecialtySchema.safeParse({
      name: "Cardiology",
      description: "Heart and cardiovascular care",
    });

    expect(result.success).toBe(true);
  });

  it("should trim whitespace from name and description", () => {
    const result = createSpecialtySchema.safeParse({
      name: "  Cardiology  ",
      description: "  Heart care  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Cardiology");
      expect(result.data.description).toBe("Heart care");
    }
  });

  it("should accept data without an optional description", () => {
    const result = createSpecialtySchema.safeParse({
      name: "Cardiology",
    });

    expect(result.success).toBe(true);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = createSpecialtySchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a name longer than 100 characters", () => {
    const result = createSpecialtySchema.safeParse({
      name: "A".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("should reject a description longer than 500 characters", () => {
    const result = createSpecialtySchema.safeParse({
      name: "Cardiology",
      description: "A".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = createSpecialtySchema.safeParse({
      name: "Cardiology",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateSpecialtySchema", () => {
  it("should accept valid specialty update data", () => {
    const result = updateSpecialtySchema.safeParse({
      name: "Neurology",
      description: "Nervous system care",
      isActive: true,
    });

    expect(result.success).toBe(true);
  });

  it("should accept an empty object because all fields are optional", () => {
    const result = updateSpecialtySchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should trim whitespace from updated fields", () => {
    const result = updateSpecialtySchema.safeParse({
      name: "  Neurology  ",
      description: "  Nervous system care  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Neurology");
      expect(result.data.description).toBe("Nervous system care");
    }
  });

  it("should accept isActive = false", () => {
    const result = updateSpecialtySchema.safeParse({
      isActive: false,
    });

    expect(result.success).toBe(true);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = updateSpecialtySchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a name longer than 100 characters", () => {
    const result = updateSpecialtySchema.safeParse({
      name: "A".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("should reject a description longer than 500 characters", () => {
    const result = updateSpecialtySchema.safeParse({
      description: "A".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it("should reject a string instead of a boolean for isActive", () => {
    const result = updateSpecialtySchema.safeParse({
      isActive: "true",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateSpecialtySchema.safeParse({
      name: "Neurology",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("specialtyIdSchema", () => {
  it("should accept a valid specialty ID", () => {
    const result = specialtyIdSchema.safeParse({
      specialtyId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid specialty ID", () => {
    const result = specialtyIdSchema.safeParse({
      specialtyId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = specialtyIdSchema.safeParse({
      specialtyId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
