import Booking from "../models/booking.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";
import AppError from "../errors/app-error.js";

export async function createBooking(appointmentId, userId) {
  const appointment = await AvailableAppointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.status !== "reserved") {
    throw new AppError(
      "Appointment must be reserved before creating a booking",
      409,
    );
  }

  if (!appointment.reservedBy) {
    throw new AppError(
      "Appointment is not reserved by any patient",
      409,
    );
  }

  if (appointment.reservedBy.toString() !== userId.toString()) {
    throw new AppError(
      "Appointment is reserved by another patient",
      409,
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

  const existingBooking = await Booking.findOne({
    appointment: appointmentId,
  });

  if (existingBooking) {
    throw new AppError(
      "A booking already exists for this appointment",
      409,
    );
  }

  const overlappingBooking = await Booking.findOne({
    patient: userId,
    status: {
      $in: ["pending", "confirmed"],
    },
    date: appointment.date,
    startTime: {
      $lt: appointment.endTime,
    },
    endTime: {
      $gt: appointment.startTime,
    },
  });

  if (overlappingBooking) {
    throw new AppError(
      "Patient already has an overlapping booking",
      409,
    );
  }

  const booking = await Booking.create({
    patient: userId,
    appointment: appointment._id,
    doctor: appointment.doctor,
    clinic: appointment.clinic,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: "pending",
  });

  return booking;
}