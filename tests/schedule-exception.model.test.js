
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import ScheduleException from "../src/models/schedule-exception.model.js";

describe("ScheduleException model", () => {
  const validException = () => ({
    clinic: new mongoose.Types.ObjectId(),
    date: new Date("2026-11-10T00:00:00.000Z"),
    type: "closed",
  });

  it("should require clinic, date, and type", async () => {
    const exception = new ScheduleException({});
    const error = await exception
      .validate()
      .catch((validationError) => validationError);

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.clinic).toBeDefined();
    expect(error.errors.date).toBeDefined();
    expect(error.errors.type).toBeDefined();
  });

  it("should accept a valid schedule exception", async () => {
    const exception = new ScheduleException(validException());

    await expect(exception.validate()).resolves.toBeUndefined();
  });

  it("should accept the closed type", async () => {
    const exception = new ScheduleException({
      ...validException(),
      type: "closed",
    });

    await expect(exception.validate()).resolves.toBeUndefined();
  });

  it("should accept the modified type", async () => {
    const exception = new ScheduleException({
      ...validException(),
      type: "modified",
      startTime: "10:00",
      endTime: "14:00",
    });

    await expect(exception.validate()).resolves.toBeUndefined();
  });

  it("should reject an unsupported type", async () => {
    const exception = new ScheduleException({
      ...validException(),
      type: "holiday",
    });

    await expect(exception.validate()).rejects.toThrow(
      /type/,
    );
  });

  it("should apply default values", () => {
    const exception = new ScheduleException(validException());

    expect(exception.doctor).toBeNull();
    expect(exception.startTime).toBeNull();
    expect(exception.endTime).toBeNull();
    expect(exception.isActive).toBe(true);
  });

  it("should trim the reason", () => {
    const exception = new ScheduleException({
      ...validException(),
      reason: "  Doctor unavailable  ",
    });

    expect(exception.reason).toBe("Doctor unavailable");
  });

  it("should reject a reason longer than 500 characters", async () => {
    const exception = new ScheduleException({
      ...validException(),
      reason: "a".repeat(501),
    });

    await expect(exception.validate()).rejects.toThrow(
      /reason/,
    );
  });

  it("should accept a reason of exactly 500 characters", async () => {
    const exception = new ScheduleException({
      ...validException(),
      reason: "a".repeat(500),
    });

    await expect(exception.validate()).resolves.toBeUndefined();
  });

  it("should define the doctor, clinic, and date index", () => {
    const index = ScheduleException.schema.indexes().find(
      ([fields]) =>
        fields.doctor === 1 &&
        fields.clinic === 1 &&
        fields.date === 1,
    );

    expect(index).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(ScheduleException.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the ScheduleException model", () => {
    expect(ScheduleException).toBe(
      mongoose.models.ScheduleException,
    );
  });
});
