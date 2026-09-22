import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import AppError from "../errors/app-error.js";

export async function refundPaymentForBooking(bookingId) {
  const payment = await Payment.findOne({
    booking: bookingId,
  });

  if (!payment) {
    return null;
  }

  if (payment.status === "refunded") {
    throw new AppError(
      "Payment has already been refunded",
      409,
    );
  }

  if (payment.status !== "paid") {
    throw new AppError(
      "Only paid payments can be refunded",
      409,
    );
  }

  /*
   * Real gateway refund will be connected later.
   *
   * For now we complete the business-level refund state.
   */

  payment.status = "refunded";
  payment.refundedAt = new Date();

  await payment.save();

  return payment;
}