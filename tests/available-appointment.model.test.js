
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import AvailableAppointment from "../src/models/available-appointment.model.js";

describe("AvailableAppointment model", () => {
  const validAppointment = () => ({
    doctor: new mongoose.Types.ObjectId(),
    clinic: new mongoose.Types.ObjectId(),
    date: new Date("2026-11-10T00:00:00.000Z"),
    startTime: "09:00",
    endTime: "09:30",
    price: 500000,
  });

  it("should require doctor, clinic, date, startTime, endTime, and price", () => {
    const appointment = new AvailableAppointment({});
    const error = appointment.validateSync();

    for (const field of [
      "doctor",
      "clinic",
      "date",
      "startTime",
      "endTime",
      "price",
    ]) {
      expect(error.errors[field]).toBeDefined();
    }
  });

  it("should apply the default values", () => {
    const appointment = new AvailableAppointment(validAppointment());

    expect(appointment.status).toBe("available");
    expect(appointment.reservedBy).toBeNull();
    expect(appointment.reservedUntil).toBeNull();
  });

  it("should accept valid statuses", async () => {
    for (const status of [
      "available",
      "reserved",
      "booked",
      "suspended",
    ]) {
      const appointment = new AvailableAppointment({
        ...validAppointment(),
        status,
      });

      await expect(appointment.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject an unsupported status", async () => {
    const appointment = new AvailableAppointment({
      ...validAppointment(),
      status: "cancelled",
    });

    await expect(appointment.validate()).rejects.toThrow(/status/);
  });

  it("should reject a negative price", async () => {
    const appointment = new AvailableAppointment({
      ...validAppointment(),
      price: -1,
    });

    await expect(appointment.validate()).rejects.toThrow(/price/);
  });

  it("should accept a zero price", async () => {
    const appointment = new AvailableAppointment({
      ...validAppointment(),
      price: 0,
    });

    await expect(appointment.validate()).resolves.toBeUndefined();
  });

  it("should define a unique compound index for doctor, date, and time", () => {
    const index = AvailableAppointment.schema.indexes().find(
      ([fields, options]) =>
        fields.doctor === 1 &&
        fields.date === 1 &&
        fields.startTime === 1 &&
        fields.endTime === 1 &&
        options.unique === true,
    );

    expect(index).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(AvailableAppointment.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the AvailableAppointment model", () => {
    expect(AvailableAppointment).toBe(
      mongoose.models.AvailableAppointment,
    );
  });
});
