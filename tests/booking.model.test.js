
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Booking from "../src/models/booking.model.js";

describe("Booking model", () => {
  const validBooking = () => ({
    patient: new mongoose.Types.ObjectId(),
    appointment: new mongoose.Types.ObjectId(),
    doctor: new mongoose.Types.ObjectId(),
    clinic: new mongoose.Types.ObjectId(),
    date: new Date("2026-11-10T00:00:00.000Z"),
    startTime: "09:00",
    endTime: "09:30",
    amountInRial: 500000,
  });

  it("should require all mandatory fields", () => {
    const booking = new Booking({});
    const error = booking.validateSync();

    for (const field of [
      "patient",
      "appointment",
      "doctor",
      "clinic",
      "date",
      "startTime",
      "endTime",
      "amountInRial",
    ]) {
      expect(error.errors[field]).toBeDefined();
    }
  });

  it("should apply the default values", () => {
    const booking = new Booking(validBooking());

    expect(booking.status).toBe("pending");
    expect(booking.refundEligible).toBe(false);
    expect(booking.cancellationReason).toBeNull();
  });

  it("should accept all supported statuses", async () => {
    for (const status of [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "patient_no_show",
    ]) {
      const booking = new Booking({
        ...validBooking(),
        status,
      });

      await expect(booking.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject an unsupported status", async () => {
    const booking = new Booking({
      ...validBooking(),
      status: "reserved",
    });

    await expect(booking.validate()).rejects.toThrow(/status/);
  });

  it("should accept all supported cancellation reasons", async () => {
    for (const cancellationReason of [
      "payment_timeout",
      "patient_cancelled",
      "doctor_cancelled",
      "admin_cancelled",
    ]) {
      const booking = new Booking({
        ...validBooking(),
        cancellationReason,
      });

      await expect(booking.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject an unsupported cancellation reason", async () => {
    const booking = new Booking({
      ...validBooking(),
      cancellationReason: "other",
    });

    await expect(booking.validate()).rejects.toThrow(
      /cancellationReason/,
    );
  });

  it("should reject a negative amountInRial", async () => {
    const booking = new Booking({
      ...validBooking(),
      amountInRial: -1,
    });

    await expect(booking.validate()).rejects.toThrow(/amountInRial/);
  });

  it("should accept a zero amountInRial", async () => {
    const booking = new Booking({
      ...validBooking(),
      amountInRial: 0,
    });

    await expect(booking.validate()).resolves.toBeUndefined();
  });

  it("should define appointment as a unique field", () => {
    const appointmentIndex = Booking.schema.indexes().find(
      ([fields, options]) =>
        fields.appointment === 1 && options.unique === true,
    );

    expect(appointmentIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Booking.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Booking model", () => {
    expect(Booking).toBe(mongoose.models.Booking);
  });
});
