
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Doctor from "../src/models/doctor.model.js";

describe("Doctor model", () => {
  it("should require user, clinic, specialty, medicalCode, and consultationFee", async () => {
    const doctor = new Doctor({});

    await expect(doctor.validate()).rejects.toThrow();

    const error = doctor.validateSync();

    expect(error.errors.user).toBeDefined();
    expect(error.errors.clinic).toBeDefined();
    expect(error.errors.specialty).toBeDefined();
    expect(error.errors.medicalCode).toBeDefined();
    expect(error.errors.consultationFee).toBeDefined();
  });

  it("should trim medicalCode, bio, and profileImage", () => {
    const doctor = new Doctor({
      user: new mongoose.Types.ObjectId(),
      clinic: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      medicalCode: "  MED-123  ",
      consultationFee: 500000,
      bio: "  Experienced doctor  ",
      profileImage: "  /uploads/doctor.jpg  ",
    });

    expect(doctor.medicalCode).toBe("MED-123");
    expect(doctor.bio).toBe("Experienced doctor");
    expect(doctor.profileImage).toBe("/uploads/doctor.jpg");
  });

  it("should apply the default values", () => {
    const doctor = new Doctor({
      user: new mongoose.Types.ObjectId(),
      clinic: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      medicalCode: "MED-123",
      consultationFee: 500000,
    });

    expect(doctor.bio).toBe("");
    expect(doctor.profileImage).toBeNull();
    expect(doctor.isActive).toBe(false);
  });

  it("should accept a zero consultation fee", async () => {
    const doctor = new Doctor({
      user: new mongoose.Types.ObjectId(),
      clinic: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      medicalCode: "MED-123",
      consultationFee: 0,
    });

    await expect(doctor.validate()).resolves.toBeUndefined();
  });

  it("should reject a negative consultation fee", async () => {
    const doctor = new Doctor({
      user: new mongoose.Types.ObjectId(),
      clinic: new mongoose.Types.ObjectId(),
      specialty: new mongoose.Types.ObjectId(),
      medicalCode: "MED-123",
      consultationFee: -1,
    });

    await expect(doctor.validate()).rejects.toThrow(/consultationFee/);
  });

  it("should define user and medicalCode as unique fields", () => {
    const indexes = Doctor.schema.indexes();

    const userIndex = indexes.find(
      ([fields, options]) =>
        fields.user === 1 && options.unique === true,
    );

    const medicalCodeIndex = indexes.find(
      ([fields, options]) =>
        fields.medicalCode === 1 && options.unique === true,
    );

    expect(userIndex).toBeDefined();
    expect(medicalCodeIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Doctor.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Doctor model", () => {
    expect(Doctor).toBe(mongoose.models.Doctor);
  });
});
