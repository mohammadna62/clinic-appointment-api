import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/models/payment.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../src/models/booking.model.js", () => ({
  default: {
    findById: vi.fn(),
  },
}));

import Payment from "../src/models/payment.model.js";
import Booking from "../src/models/booking.model.js";

import { refundPayment } from "../src/services/refund.service.js";

describe("Refund Service", () => {
  const paymentId = "payment123";
  const bookingId = "booking123";

  let payment;
  let booking;

  beforeEach(() => {
    vi.resetAllMocks();

    payment = {
      _id: paymentId,
      booking: bookingId,
      status: "paid",
      refundedAt: null,
      save: vi.fn().mockResolvedValue(undefined),
    };

    booking = {
      _id: bookingId,
      status: "cancelled",
      refundEligible: true,
    };

    Payment.findById.mockResolvedValue(payment);
    Booking.findById.mockResolvedValue(booking);
  });

  describe("refundPayment", () => {
    it("should refund a paid payment for an eligible cancelled booking", async () => {
      const result = await refundPayment(paymentId);

      expect(Payment.findById).toHaveBeenCalledWith(paymentId);
      expect(Booking.findById).toHaveBeenCalledWith(bookingId);

      expect(payment.status).toBe("refunded");
      expect(payment.refundedAt).toBeInstanceOf(Date);
      expect(payment.save).toHaveBeenCalledOnce();

      expect(result).toBe(payment);
    });

    it("should throw 404 if the payment does not exist", async () => {
      Payment.findById.mockResolvedValue(null);

      await expect(refundPayment(paymentId)).rejects.toMatchObject({
        message: "Payment not found",
        statusCode: 404,
      });

      expect(Booking.findById).not.toHaveBeenCalled();
    });

    it("should throw 409 if the payment is not paid", async () => {
      payment.status = "pending";

      await expect(refundPayment(paymentId)).rejects.toMatchObject({
        message: "Only paid payments can be refunded",
        statusCode: 409,
      });

      expect(Booking.findById).not.toHaveBeenCalled();
      expect(payment.save).not.toHaveBeenCalled();
    });

    it("should throw 404 if the associated booking does not exist", async () => {
      Booking.findById.mockResolvedValue(null);

      await expect(refundPayment(paymentId)).rejects.toMatchObject({
        message: "Booking not found",
        statusCode: 404,
      });

      expect(payment.save).not.toHaveBeenCalled();
    });

    it("should throw 409 if the booking is not cancelled", async () => {
      booking.status = "confirmed";

      await expect(refundPayment(paymentId)).rejects.toMatchObject({
        message: "Only cancelled bookings can be refunded",
        statusCode: 409,
      });

      expect(payment.save).not.toHaveBeenCalled();
    });

    it("should throw 409 if the booking is not eligible for a refund", async () => {
      booking.refundEligible = false;

      await expect(refundPayment(paymentId)).rejects.toMatchObject({
        message: "This booking is not eligible for a refund",
        statusCode: 409,
      });

      expect(payment.save).not.toHaveBeenCalled();
    });

    it("should not change the payment if the booking is not eligible", async () => {
      booking.refundEligible = false;

      await expect(refundPayment(paymentId)).rejects.toThrow();

      expect(payment.status).toBe("paid");
      expect(payment.refundedAt).toBeNull();
      expect(payment.save).not.toHaveBeenCalled();
    });

    it("should propagate an error if saving the refund fails", async () => {
      payment.save.mockRejectedValue(new Error("Database unavailable"));

      await expect(refundPayment(paymentId)).rejects.toThrow(
        "Database unavailable",
      );

      expect(payment.status).toBe("refunded");
      expect(payment.refundedAt).toBeInstanceOf(Date);
    });
  });
});