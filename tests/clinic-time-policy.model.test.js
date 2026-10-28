
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import ClinicTimePolicy from "../src/models/clinic-time-policy.model.js";

describe("ClinicTimePolicy model", () => {
  const validPolicy = () => ({
    clinic: new mongoose.Types.ObjectId(),
  });


  it("should require clinic while applying defaults to time fields", async () => {
    const policy = new ClinicTimePolicy({});

    const error = await policy.validate().catch((validationError) => validationError);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.clinic).toBeDefined();

    for (const field of [
      "morningStart",
      "morningEnd",
      "eveningStart",
      "eveningEnd",
    ]) {
      expect(error.errors[field]).toBeUndefined();
    }
  });

  it("should apply the default values", () => {
    const policy = new ClinicTimePolicy(validPolicy());

    expect(policy.morningStart).toBe("08:00");
    expect(policy.morningEnd).toBe("12:00");
    expect(policy.eveningStart).toBe("14:00");
    expect(policy.eveningEnd).toBe("18:00");
    expect(policy.appointmentDuration).toBe(30);
    expect(policy.isActive).toBe(true);
  });

  it("should accept a valid policy", async () => {
    const policy = new ClinicTimePolicy(validPolicy());

    await expect(policy.validate()).resolves.toBeUndefined();
  });

  it("should accept an appointment duration of 5 minutes", async () => {
    const policy = new ClinicTimePolicy({
      ...validPolicy(),
      appointmentDuration: 5,
    });

    await expect(policy.validate()).resolves.toBeUndefined();
  });

  it("should reject an appointment duration below 5 minutes", async () => {
    const policy = new ClinicTimePolicy({
      ...validPolicy(),
      appointmentDuration: 4,
    });

    await expect(policy.validate()).rejects.toThrow(
      /appointmentDuration/,
    );
  });

  it("should accept a custom appointment duration", async () => {
    const policy = new ClinicTimePolicy({
      ...validPolicy(),
      appointmentDuration: 45,
    });

    await expect(policy.validate()).resolves.toBeUndefined();
  });

  it("should define clinic as a unique field", () => {
    const clinicIndex = ClinicTimePolicy.schema.indexes().find(
      ([fields, options]) =>
        fields.clinic === 1 && options.unique === true,
    );

    expect(clinicIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(ClinicTimePolicy.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the ClinicTimePolicy model", () => {
    expect(ClinicTimePolicy).toBe(
      mongoose.models.ClinicTimePolicy,
    );
  });
});
