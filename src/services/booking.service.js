import Booking from "../models/booking.model.js";
import Doctor from "./../models/doctor.model.js";
import AvailableAppointment from "../models/available-appointment.model.js";
import Payment from "./../models/payment.model.js";
import AppError from "../errors/app-error.js";
import { createPaginationData } from "./../utils/pagination.util.js";
import { refundPaymentForBooking } from "./refund.service.js";

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
    throw new AppError("Appointment is not reserved by any patient", 409);
  }

  if (appointment.reservedBy.toString() !== userId.toString()) {
    throw new AppError("Appointment is reserved by another patient", 409);
  }

  if (!appointment.reservedUntil || appointment.reservedUntil <= new Date()) {
    throw new AppError("Appointment reservation has expired", 409);
  }

  const existingBooking = await Booking.findOne({
    appointment: appointmentId,
  });

  if (existingBooking) {
    throw new AppError("A booking already exists for this appointment", 409);
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
    throw new AppError("Patient already has an overlapping booking", 409);
  }

  const booking = await Booking.create({
    patient: userId,
    appointment: appointment._id,
    doctor: appointment.doctor,
    clinic: appointment.clinic,
    date: appointment.date,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    amountInRial: appointment.price,
    status: "pending",
  });

  return booking;
}

export async function getPatientBookings(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const filter = {
    patient: userId,
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate({
        path: "doctor",
        select: "specialty consultationFee",
        populate: {
          path: "user",
          select: "firstName lastName",
        },
      })
      .populate("clinic", "name")
      .populate("appointment", "date startTime endTime status")
      .sort({
        date: -1,
        startTime: -1,
      })
      .skip(skip)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: createPaginationData(page, limit, total),
  };
}

export async function getPatientBookingById(bookingId, userId) {
  const booking = await Booking.findOne({
    _id: bookingId,
    patient: userId,
  })
    .populate({
      path: "doctor",
      select: "specialty consultationFee",
      populate: {
        path: "user",
        select: "firstName lastName",
      },
    })
    .populate("clinic", "name")
    .populate("appointment", "date startTime endTime status");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
}

export async function cancelPatientBooking(bookingId, userId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.patient.toString() !== userId.toString()) {
    throw new AppError(
      "You are not allowed to cancel this booking",
      403,
    );
  }

  if (
    booking.status !== "pending" &&
    booking.status !== "confirmed"
  ) {
    throw new AppError(
      "Only pending or confirmed bookings can be cancelled",
      409,
    );
  }

  const year = booking.date.getUTCFullYear();
  const month = String(booking.date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(booking.date.getUTCDate()).padStart(2, "0");

  const appointmentStart = new Date(
    `${year}-${month}-${day}T${booking.startTime}:00.000Z`,
  );

  const now = new Date();

  if (appointmentStart <= now) {
    throw new AppError(
      "Booking cannot be cancelled after the appointment has started",
      409,
    );
  }

  const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

  const millisecondsUntilAppointment =
    appointmentStart.getTime() - now.getTime();

  const refundEligible =
    millisecondsUntilAppointment >= twentyFourHoursInMs;

  const payment = await Payment.findOne({
    booking: booking._id,
  });

  let refundedPayment = null;

  if (payment?.status === "pending") {
    payment.status = "failed";
    await payment.save();
  }

  if (
    payment?.status === "paid" &&
    refundEligible
  ) {
    refundedPayment =
      await refundPaymentForBooking(booking._id);
  }

  booking.status = "cancelled";
  booking.cancellationReason = "patient_cancelled";

  await booking.save();

  const appointment = await AvailableAppointment.findOneAndUpdate(
    {
      _id: booking.appointment,
      status: {
        $in: ["reserved", "booked"],
      },
    },
    {
      $set: {
        status: "available",
        reservedBy: null,
        reservedUntil: null,
      },
    },
    { new: true },
  );

  return {
    booking,
    appointment,
    payment: refundedPayment,
    refundEligible,
  };
}
export async function getDoctorBookings(userId, page = 1, limit = 20) {
  const currentDoctor = await Doctor.findOne({ user: userId });
  if (!currentDoctor) {
    throw new AppError("Doctor profile not found", 404);
  }
  const skip = (page - 1) * limit;

  const filter = {
    doctor: currentDoctor._id,
  };

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("patient", "firstName lastName phone")
      .populate("clinic", "name")
      .populate("appointment", "date startTime endTime status")
      .sort({
        date: -1,
        startTime: -1,
      })
      .skip(skip)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: createPaginationData(page, limit, total),
  };
}

export async function getDoctorBookingById(bookingId, userId) {
  const currentDoctor = await Doctor.findOne({ user: userId });
  if (!currentDoctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    doctor: currentDoctor._id,
  })
    .populate("patient", "firstName lastName phone")
    .populate("clinic", "name")
    .populate("appointment", "date startTime endTime status");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
}

export async function completeDoctorBooking(bookingId, userId) {
  const currentDoctor = await Doctor.findOne({
    user: userId,
  });

  if (!currentDoctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    doctor: currentDoctor._id,
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "confirmed") {
    throw new AppError("Only confirmed bookings can be completed", 409);
  }

  const year = booking.date.getUTCFullYear();

  const month = String(booking.date.getUTCMonth() + 1).padStart(2, "0");

  const day = String(booking.date.getUTCDate()).padStart(2, "0");

  const appointmentStart = new Date(
    `${year}-${month}-${day}T${booking.startTime}:00.000Z`,
  );

  const now = new Date();

  if (appointmentStart > now) {
    throw new AppError(
      "Booking cannot be completed before the appointment starts",
      409,
    );
  }

  booking.status = "completed";

  await booking.save();

  return booking;
}

export async function markPatientNoShow(bookingId, userId) {
  const currentDoctor = await Doctor.findOne({
    user: userId,
  });

  if (!currentDoctor) {
    throw new AppError("Doctor profile not found", 404);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    doctor: currentDoctor._id,
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "confirmed") {
    throw new AppError(
      "Only confirmed bookings can be marked as patient no-show",
      409,
    );
  }

  const year = booking.date.getUTCFullYear();

  const month = String(booking.date.getUTCMonth() + 1).padStart(2, "0");

  const day = String(booking.date.getUTCDate()).padStart(2, "0");

  const appointmentStart = new Date(
    `${year}-${month}-${day}T${booking.startTime}:00.000Z`,
  );

  const now = new Date();

  if (appointmentStart > now) {
    throw new AppError(
      "Patient cannot be marked as no-show before the appointment starts",
      409,
    );
  }

  booking.status = "patient_no_show";

  await booking.save();

  return booking;
}
export async function getAdminBookings(page = 1, limit = 20, status) {
  const skip = (page - 1) * limit;

  const filter = {};

  if (status) {
    filter.status = status;
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("patient", "firstName lastName phone")
      .populate({
        path: "doctor",
        select: "specialty consultationFee",
        populate: {
          path: "user",
          select: "firstName lastName phone",
        },
      })
      .populate("clinic", "name")
      .populate("appointment", "date startTime endTime status")
      .sort({
        date: -1,
        startTime: -1,
      })
      .skip(skip)
      .limit(limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: createPaginationData(page, limit, total),
  };
}
export async function getAdminBookingById(bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate("patient", "firstName lastName phone")
    .populate({
      path: "doctor",
      select: "specialty consultationFee",
      populate: {
        path: "user",
        select: "firstName lastName phone",
      },
    })
    .populate("clinic", "name")
    .populate("appointment", "date startTime endTime status");

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
}
