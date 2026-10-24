
import { describe, it, expect } from "vitest";

import {
  createDoctorSchema,
  doctorIdSchema,
  updateDoctorSchema,
  updateDoctorStatusSchema,
  getDoctorsQuerySchema,
  clinicIdSchema,
} from "../src/validators/doctor.validator.js";

describe("createDoctorSchema", () => {
  const validDoctor = {
    clinic: "507f1f77bcf86cd799439011",
    specialty: "507f1f77bcf86cd799439012",
    medicalCode: "MED-123",
    bio: "Experienced physician",
    consultationFee: 250,
  };

  it("should accept valid doctor data", () => {
    const result = createDoctorSchema.safeParse(validDoctor);

    expect(result.success).toBe(true);
  });

  it("should coerce consultationFee from string to number", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      consultationFee: "250",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.consultationFee).toBe(250);
    }
  });

  it("should reject a consultation fee of zero", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      consultationFee: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject a negative consultation fee", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      consultationFee: -100,
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty medical code", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      medicalCode: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a bio longer than 1000 characters", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      bio: "A".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("should reject missing required fields", () => {
    const result = createDoctorSchema.safeParse({
      clinic: validDoctor.clinic,
      specialty: validDoctor.specialty,
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = createDoctorSchema.safeParse({
      ...validDoctor,
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("doctorIdSchema", () => {
  it("should accept a valid doctor ID", () => {
    const result = doctorIdSchema.safeParse({
      doctorId: "507f1f77bcf86cd799439011",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid doctor ID", () => {
    const result = doctorIdSchema.safeParse({
      doctorId: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = doctorIdSchema.safeParse({
      doctorId: "507f1f77bcf86cd799439011",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateDoctorSchema", () => {
  it("should accept valid doctor update data", () => {
    const result = updateDoctorSchema.safeParse({
      clinic: "507f1f77bcf86cd799439011",
      specialty: "507f1f77bcf86cd799439012",
      medicalCode: "MED-456",
      bio: "Updated biography",
      consultationFee: 300,
    });

    expect(result.success).toBe(true);
  });

  it("should accept an empty object because all fields are optional", () => {
    const result = updateDoctorSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("should coerce consultationFee from string to number", () => {
    const result = updateDoctorSchema.safeParse({
      consultationFee: "350",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.consultationFee).toBe(350);
    }
  });

  it("should reject a zero consultation fee", () => {
    const result = updateDoctorSchema.safeParse({
      consultationFee: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty medical code", () => {
    const result = updateDoctorSchema.safeParse({
      medicalCode: "   ",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a bio longer than 1000 characters", () => {
    const result = updateDoctorSchema.safeParse({
      bio: "A".repeat(1001),
    });

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateDoctorSchema.safeParse({
      medicalCode: "MED-456",
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("updateDoctorStatusSchema", () => {
  it.each([true, false])(
    "should accept isActive = %s",
    (isActive) => {
      const result = updateDoctorStatusSchema.safeParse({
        isActive,
      });

      expect(result.success).toBe(true);
    },
  );

  it("should reject a string instead of a boolean", () => {
    const result = updateDoctorStatusSchema.safeParse({
      isActive: "true",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing isActive field", () => {
    const result = updateDoctorStatusSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject unknown fields", () => {
    const result = updateDoctorStatusSchema.safeParse({
      isActive: true,
      extraField: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});

describe("getDoctorsQuerySchema", () => {
  it("should apply default pagination values", () => {
    const result = getDoctorsQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should coerce pagination values to numbers", () => {
    const result = getDoctorsQuerySchema.safeParse({
      page: "2",
      limit: "50",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it.each(["active", "inactive"])(
    "should accept status '%s'",
    (status) => {
      const result = getDoctorsQuerySchema.safeParse({ status });

      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.status).toBe(status);
      }
    },
  );

  it("should reject an invalid status", () => {
    const result = getDoctorsQuerySchema.safeParse({
      status: "suspended",
    });

    expect(result.success).toBe(false);
  });

  it("should reject page values below 1", () => {
    const result = getDoctorsQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit values above 100", () => {
    const result = getDoctorsQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("should ignore unknown query parameters", () => {
    const result = getDoctorsQuerySchema.safeParse({
      extraField: "unexpected",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).not.toHaveProperty("extraField");
    }
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
