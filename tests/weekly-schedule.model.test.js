
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import WeeklySchedule from "../src/models/weekly-schedule.model.js";

describe("WeeklySchedule model", () => {
  it("should require clinic and dayOfWeek", async () => {
    const schedule = new WeeklySchedule({});

    const error = schedule.validateSync();

    expect(error.errors.clinic).toBeDefined();
    expect(error.errors.dayOfWeek).toBeDefined();
  });

  it("should accept dayOfWeek values from 0 to 6", async () => {
    for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
      const schedule = new WeeklySchedule({
        clinic: new mongoose.Types.ObjectId(),
        dayOfWeek,
      });

      await expect(schedule.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject dayOfWeek values outside the range", async () => {
    for (const dayOfWeek of [-1, 7]) {
      const schedule = new WeeklySchedule({
        clinic: new mongoose.Types.ObjectId(),
        dayOfWeek,
      });

      await expect(schedule.validate()).rejects.toThrow(/dayOfWeek/);
    }
  });

  it("should apply the default values", () => {
    const schedule = new WeeklySchedule({
      clinic: new mongoose.Types.ObjectId(),
      dayOfWeek: 1,
    });

    expect(schedule.isActive).toBe(true);
    expect(schedule.morningStart).toBeNull();
    expect(schedule.morningEnd).toBeNull();
    expect(schedule.eveningStart).toBeNull();
    expect(schedule.eveningEnd).toBeNull();
  });

  it("should define a unique compound index on clinic and dayOfWeek", () => {
    const index = WeeklySchedule.schema.indexes().find(
      ([fields, options]) =>
        fields.clinic === 1 &&
        fields.dayOfWeek === 1 &&
        options.unique === true,
    );

    expect(index).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(WeeklySchedule.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the WeeklySchedule model", () => {
    expect(WeeklySchedule).toBe(mongoose.models.WeeklySchedule);
  });
});
