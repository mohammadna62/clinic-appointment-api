import Payment from "../models/payment.model.js";
import Booking from "../models/booking.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";
import AppError from "../errors/app-error.js";
import { createZarinpalPayment } from "./zarinpal.service.js";

export async function createPayment(bookingId, userId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.patient.toString() !== userId.toString()) {
    throw new AppError(
      "You are not allowed to pay for this booking",
      403,
    );
  }

  if (booking.status !== "pending") {
    throw new AppError(
      "Only pending bookings can be paid",
      409,
    );
  }

  const appointment = await AvailableAppointment.findById(
    booking.appointment,
  );

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.status !== "reserved") {
    throw new AppError(
      "Appointment is no longer reserved",
      409,
    );
  }

  if (!appointment.reservedBy) {
    throw new AppError(
      "Appointment is not reserved by any patient",
      409,
    );
  }

  if (
    appointment.reservedBy.toString() !== userId.toString()
  ) {
    throw new AppError(
      "Appointment is reserved by another patient",
      403,
    );
  }

  if (
    !appointment.reservedUntil ||
    appointment.reservedUntil <= new Date()
  ) {
    throw new AppError(
      "Appointment reservation has expired",
      409,
    );
  }

  const existingPayment = await Payment.findOne({
    booking: bookingId,
  });

  if (existingPayment) {
    throw new AppError(
      "A payment already exists for this booking",
      409,
    );
  }

  const payment = await Payment.create({
    booking: booking._id,
    patient: booking.patient,
    amountInRial: booking.amountInRial,
    status: "pending",
  });

  try {
    const paymentRequest = await createZarinpalPayment({
      amountInRial: payment.amountInRial,
      description: `Clinic appointment payment - ${booking._id}`,
      mobile: undefined,
    });

    payment.authority = paymentRequest.authority;

    await payment.save();

    return {
      payment,
      paymentUrl: paymentRequest.paymentUrl,
    };
  } catch (error) {
    await Payment.findByIdAndDelete(payment._id);

    throw new AppError(
      "Unable to create payment request",
      502,
    );
  }
}