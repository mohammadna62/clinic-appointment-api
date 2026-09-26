import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import AppError from "../errors/app-error.js";

export async function refundPayment(paymentId) {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status !== "paid") {
    throw new AppError(
      "Only paid payments can be refunded",
      409,
    );
  }

  const booking = await Booking.findById(payment.booking);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "cancelled") {
    throw new AppError(
      "Only cancelled bookings can be refunded",
      409,
    );
  }

  if (!booking.refundEligible) {
    throw new AppError(
      "This booking is not eligible for a refund",
      409,
    );
  }

  payment.status = "refunded";
  payment.refundedAt = new Date();

  await payment.save();

  return payment;
}