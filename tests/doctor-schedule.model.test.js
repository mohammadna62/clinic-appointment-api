
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import DoctorSchedule from "../src/models/doctor-schedule.model.js";

describe("DoctorSchedule model", () => {
  const validSchedule = () => ({
    doctor: new mongoose.Types.ObjectId(),
    clinic: new mongoose.Types.ObjectId(),
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
  });

  it("should require all mandatory fields", async () => {
    const schedule = new DoctorSchedule({});
    const error = await schedule
      .validate()
      .catch((validationError) => validationError);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);

    for (const field of [
      "doctor",
      "clinic",
      "dayOfWeek",
      "startTime",
      "endTime",
    ]) {
      expect(error.errors[field]).toBeDefined();
    }
  });

  it("should accept a valid schedule", async () => {
    const schedule = new DoctorSchedule(validSchedule());

    await expect(schedule.validate()).resolves.toBeUndefined();
  });

  it("should accept dayOfWeek values from 0 to 6", async () => {
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const schedule = new DoctorSchedule({
        ...validSchedule(),
        dayOfWeek,
      });

      await expect(schedule.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject dayOfWeek below 0", async () => {
    const schedule = new DoctorSchedule({
      ...validSchedule(),
      dayOfWeek: -1,
    });

    await expect(schedule.validate()).rejects.toThrow(/dayOfWeek/);
  });

  it("should reject dayOfWeek above 6", async () => {
    const schedule = new DoctorSchedule({
      ...validSchedule(),
      dayOfWeek: 7,
    });

    await expect(schedule.validate()).rejects.toThrow(/dayOfWeek/);
  });

  it("should reject a non-numeric dayOfWeek", async () => {
    const schedule = new DoctorSchedule({
      ...validSchedule(),
      dayOfWeek: "Monday",
    });

    await expect(schedule.validate()).rejects.toThrow(/dayOfWeek/);
  });

  it("should default isActive to true", () => {
    const schedule = new DoctorSchedule(validSchedule());

    expect(schedule.isActive).toBe(true);
  });

  it("should allow isActive to be set to false", async () => {
    const schedule = new DoctorSchedule({
      ...validSchedule(),
      isActive: false,
    });

    await expect(schedule.validate()).resolves.toBeUndefined();
    expect(schedule.isActive).toBe(false);
  });

  it("should define a unique index for doctor, dayOfWeek, startTime, and endTime", () => {
    const index = DoctorSchedule.schema.indexes().find(
      ([fields, options]) =>
        fields.doctor === 1 &&
        fields.dayOfWeek === 1 &&
        fields.startTime === 1 &&
        fields.endTime === 1 &&
        options.unique === true,
    );

    expect(index).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(DoctorSchedule.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the DoctorSchedule model", () => {
    expect(DoctorSchedule).toBe(mongoose.models.DoctorSchedule);
  });
});
