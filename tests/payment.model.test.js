
import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import Payment from "../src/models/payment.model.js";

describe("Payment model", () => {
  const validPayment = () => ({
    booking: new mongoose.Types.ObjectId(),
    patient: new mongoose.Types.ObjectId(),
    amountInRial: 500000,
  });

  it("should require booking, patient, and amountInRial", () => {
    const payment = new Payment({});
    const error = payment.validateSync();

    expect(error.errors.booking).toBeDefined();
    expect(error.errors.patient).toBeDefined();
    expect(error.errors.amountInRial).toBeDefined();
  });

  it("should apply the default values", () => {
    const payment = new Payment(validPayment());

    expect(payment.status).toBe("pending");
    expect(payment.refId).toBeNull();
    expect(payment.paidAt).toBeNull();
    expect(payment.refundedAt).toBeNull();
  });

  it("should accept all supported statuses", async () => {
    for (const status of ["pending", "paid", "failed", "refunded"]) {
      const payment = new Payment({
        ...validPayment(),
        status,
      });

      await expect(payment.validate()).resolves.toBeUndefined();
    }
  });

  it("should reject an unsupported status", async () => {
    const payment = new Payment({
      ...validPayment(),
      status: "cancelled",
    });

    await expect(payment.validate()).rejects.toThrow(/status/);
  });

  it("should reject a negative amountInRial", async () => {
    const payment = new Payment({
      ...validPayment(),
      amountInRial: -1,
    });

    await expect(payment.validate()).rejects.toThrow(/amountInRial/);
  });

  it("should accept a zero amountInRial", async () => {
    const payment = new Payment({
      ...validPayment(),
      amountInRial: 0,
    });

    await expect(payment.validate()).resolves.toBeUndefined();
  });

  it("should define booking as a unique field", () => {
    const bookingIndex = Payment.schema.indexes().find(
      ([fields, options]) =>
        fields.booking === 1 && options.unique === true,
    );

    expect(bookingIndex).toBeDefined();
  });

  it("should define authority as a sparse unique field", () => {
    const authorityIndex = Payment.schema.indexes().find(
      ([fields, options]) =>
        fields.authority === 1 &&
        options.unique === true &&
        options.sparse === true,
    );

    expect(authorityIndex).toBeDefined();
  });

  it("should enable timestamps", () => {
    expect(Payment.schema.options.timestamps).toBe(true);
  });

  it("should be registered as the Payment model", () => {
    expect(Payment).toBe(mongoose.models.Payment);
  });
});
