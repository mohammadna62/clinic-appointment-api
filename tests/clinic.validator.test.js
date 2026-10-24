
import { describe, it, expect } from "vitest";

import {
  createClinicSchema,
  clinicIdSchema,
  updateClinicSchema,
  updateClinicStatusSchema,
} from "../src/validators/clinic.validator.js";

describe("createClinicSchema", () => {
  it("should accept valid clinic data", () => {
    const result = createClinicSchema.safeParse({
      name: "Tehran Clinic",
      description: "A general medical clinic",
    });

    expect(result.success).toBe(true);
  });

  it("should trim whitespace from name and description", () => {
    const result = createClinicSchema.safeParse({
      name: "  Tehran Clinic  ",
      description: "  Medical services  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Tehran Clinic");
      expect(result.data.description).toBe("Medical services");
    }
  });

  it("should accept data without an optional description", () => {
    const result = createClinicSchema.safeParse({
      name: "Tehran Clinic",
    });

    expect(result.success).toBe(true);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = createClinicSchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing name", () => {
    const result = createClinicSchema.safeParse({
      description: "Medical services",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = createClinicSchema.safeParse({
      name: "Tehran Clinic",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("clinicIdSchema", () => {
  it("should accept a valid clinic ID", () => {
    const result = clinicIdSchema.safeParse({
      clinicId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid clinic ID", () => {
    const result = clinicIdSchema.safeParse({
      clinicId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = clinicIdSchema.safeParse({
      clinicId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateClinicSchema", () => {
  it("should accept valid clinic update data", () => {
    const result = updateClinicSchema.safeParse({
      name: "Updated Clinic",
      description: "Updated description",
    });

    expect(result.success).toBe(true);
  });

  it("should trim whitespace from updated fields", () => {
    const result = updateClinicSchema.safeParse({
      name: "  Updated Clinic  ",
      description: "  Updated description  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Updated Clinic");
      expect(result.data.description).toBe("Updated description");
    }
  });

  it("should accept an empty object because update fields are optional", () => {
    const result = updateClinicSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = updateClinicSchema.safeParse({
      name: "A",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a name longer than 100 characters", () => {
    const result = updateClinicSchema.safeParse({
      name: "A".repeat(101),
    });

    expect(result.success).toBe(false);
  });

  it("should reject a description longer than 500 characters", () => {
    const result = updateClinicSchema.safeParse({
      description: "A".repeat(501),
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateClinicSchema.safeParse({
      name: "Updated Clinic",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateClinicStatusSchema", () => {
  it.each([true, false])(
    "should accept isActive = %s",
    (isActive) => {
      const result = updateClinicStatusSchema.safeParse({
        isActive,
      });

      expect(result.success).toBe(true);
    },
  );

  it("should reject a string instead of a boolean", () => {
    const result = updateClinicStatusSchema.safeParse({
      isActive: "true",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing isActive field", () => {
    const result = updateClinicStatusSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateClinicStatusSchema.safeParse({
      isActive: true,
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
