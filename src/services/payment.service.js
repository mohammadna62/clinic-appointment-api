import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";
import AppError from "../errors/app-error.js";

import {
  createZarinpalPayment,
  verifyZarinpalPayment,
} from "./zarinpal.service.js";

import { createPaginationData } from "./../utils/pagination.util.js";

export async function createPayment(bookingId, userId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.patient.toString() !== userId.toString()) {
    throw new AppError("You are not allowed to pay for this booking", 403);
  }

  if (booking.status !== "pending") {
    throw new AppError("Only pending bookings can be paid", 409);
  }

  const appointment = await AvailableAppointment.findById(booking.appointment);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.status !== "reserved") {
    throw new AppError("Appointment is no longer reserved", 409);
  }

  if (!appointment.reservedBy) {
    throw new AppError("Appointment is not reserved by any patient", 409);
  }

  if (appointment.reservedBy.toString() !== userId.toString()) {
    throw new AppError("Appointment is reserved by another patient", 403);
  }

  if (!appointment.reservedUntil || appointment.reservedUntil <= new Date()) {
    throw new AppError("Appointment reservation has expired", 409);
  }

  const existingPayment = await Payment.findOne({
    booking: bookingId,
  });

  if (existingPayment) {
    throw new AppError("A payment already exists for this booking", 409);
  }

  const payment = await Payment.create({
    booking: booking._id,
    patient: booking.patient,
    amountInRial: booking.amountInRial,
    status: "pending",
  });

  try {
    const gatewayPayment = await createZarinpalPayment({
      amountInRial: payment.amountInRial,
      description: `Clinic appointment - ${booking._id}`,
      mobile: undefined,
    });

    payment.authority = gatewayPayment.authority;

    await payment.save();

    return {
      payment,
      paymentUrl: gatewayPayment.paymentUrl,
    };
  } catch (error) {
    await Payment.findByIdAndDelete(payment._id);

    throw new AppError("Payment request could not be created", 502);
  }
}

export async function verifyPayment(authority, status) {
  if (!authority) {
    throw new AppError("Payment authority is required", 400);
  }

  const payment = await Payment.findOne({ authority });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  /*
   * Idempotency:
   * A payment that has already been paid must not be processed again.
   */
  if (payment.status === "paid") {
    return {
      payment,
      alreadyVerified: true,
    };
  }

  /*
   * User cancelled the payment on the gateway.
   */
  if (status !== "OK") {
    payment.status = "failed";
    await payment.save();

    const booking = await Booking.findById(payment.booking);

    if (booking && booking.status === "pending") {
      booking.status = "cancelled";
      await booking.save();
    }

    if (booking) {
      await AvailableAppointment.findOneAndUpdate(
        {
          _id: booking.appointment,
          status: "reserved",
          reservedBy: booking.patient,
        },
        {
          $set: {
            status: "available",
            reservedBy: null,
            reservedUntil: null,
          },
        },
      );
    }

    return {
      payment,
      alreadyVerified: false,
      paymentSuccessful: false,
    };
  }

  /*
   * Ask the payment gateway to verify the payment.
   *
   * IMPORTANT:
   * The amount comes from our database.
   * We never trust an amount from the callback.
   */
  const gatewayResult = await verifyZarinpalPayment({
    amountInRial: payment.amountInRial,
    authority: payment.authority,
  });

  if (gatewayResult.code !== 100 && gatewayResult.code !== 101) {
    payment.status = "failed";
    await payment.save();

    throw new AppError(
      gatewayResult.message || "Payment verification failed",
      409,
    );
  }

  const booking = await Booking.findById(payment.booking);

  if (!booking) {
    throw new AppError("Booking associated with payment not found", 404);
  }

  if (booking.status !== "pending") {
    payment.status = "paid";
    payment.refId = gatewayResult.refId;
    payment.paidAt = payment.paidAt ?? new Date();

    await payment.save();

    return {
      payment,
      alreadyVerified: true,
      paymentSuccessful: true,
    };
  }

  /*
   * Atomic transition:
   *
   * reserved → booked
   *
   * Only if the appointment is still reserved by
   * the same patient.
   */
  const appointment = await AvailableAppointment.findOneAndUpdate(
    {
      _id: booking.appointment,
      status: "reserved",
      reservedBy: booking.patient,
      reservedUntil: { $gt: new Date() },
    },
    {
      $set: {
        status: "booked",
        reservedBy: null,
        reservedUntil: null,
      },
    },
    {
      new: true,
    },
  );

  /*
   * Payment was successful, but the appointment is no longer
   * available for this booking.
   *
   * We must NOT confirm the booking.
   *
   * In a real Zarinpal integration this is the point where
   * refund handling is required.
   */
  if (!appointment) {
    payment.status = "paid";
    payment.refId = gatewayResult.refId;
    payment.paidAt = payment.paidAt ?? new Date();

    await payment.save();

    booking.status = "cancelled";
    booking.cancellationReason = "payment_timeout";

    await booking.save();

    throw new AppError(
      "Payment was successful, but the appointment is no longer available. Refund is required.",
      409,
    );
  }
  /*
   * The appointment was successfully locked for this booking.
   * Now finalize the business documents.
   */
  payment.status = "paid";
  payment.refId = gatewayResult.refId;
  payment.paidAt = payment.paidAt ?? new Date();

  await payment.save();

  booking.status = "confirmed";

  await booking.save();

  return {
    payment,
    booking,
    appointment,
    alreadyVerified: gatewayResult.code === 101,
    paymentSuccessful: true,
  };
}

export async function getAdminPayments(page = 1, limit = 20, status) {
  const skip = (page - 1) * limit;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate("patient", "firstName lastName phone")
      .populate({
        path: "booking",
        select: "doctor clinic date startTime endTime status amountInRial",
        populate: [
          {
            path: "doctor",
            select: "specialty",
            populate: {
              path: "user",
              select: "firstName lastName",
            },
          },
          {
            path: "clinic",
            select: "name",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Payment.countDocuments(filter),
  ]);

  return {
    payments,
    pagination: createPaginationData(page, limit, total),
  };
}
export async function getAdminPaymentById(paymentId) {
  const payment = await Payment.findById(paymentId)
    .populate("patient", "firstName lastName phone")
    .populate({
      path: "booking",
      select: "doctor clinic date startTime endTime status amountInRial",
      populate: [
        {
          path: "doctor",
          select: "specialty",
          populate: {
            path: "user",
            select: "firstName lastName",
          },
        },
        {
          path: "clinic",
          select: "name",
        },
      ],
    });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return payment;
}
