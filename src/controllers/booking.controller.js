import { successResponse } from "../helpers/response.js";

import {
  createBooking as createBookingService,
  getPatientBookings as getPatientBookingsService,
  getPatientBookingById as getPatientBookingByIdService,
  cancelPatientBooking as cancelPatientBookingService,
  getDoctorBookings as getDoctorBookingsService,
  getDoctorBookingById as getDoctorBookingByIdService,
  completeDoctorBooking as completeDoctorBookingService,
  markPatientNoShow as markPatientNoShowService,
} from "../services/booking.service.js";

export const createBooking = async (req, res, next) => {
  try {
    const { appointmentId } = req.validated.params;

    const booking = await createBookingService(appointmentId, req.user.userId);

    return successResponse(res, {
      statusCode: 201,
      message: "Booking created successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const getPatientBookings = async (req, res, next) => {
  try {
    const { page, limit } = req.validated.query;

    const result = await getPatientBookingsService(
      req.user.userId,
      page,
      limit,
    );

    return successResponse(res, {
      message: "Bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const booking = await getPatientBookingByIdService(
      bookingId,
      req.user.userId,
    );

    return successResponse(res, {
      message: "Booking retrieved successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};
export const cancelPatientBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const result = await cancelPatientBookingService(
      bookingId,
      req.user.userId,
    );

    return successResponse(res, {
      message: "Booking cancelled successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getDoctorBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await getDoctorBookingsService(
      req.user.userId,
      Number(page),
      Number(limit),
    );

    return successResponse(res, {
      message: "Doctor bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getDoctorBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const booking = await getDoctorBookingByIdService(
      bookingId,
      req.user.userId,
    );

    return successResponse(res, {
      message: "Booking retrieved successfully",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const completeDoctorBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const booking = await completeDoctorBookingService(
      bookingId,
      req.user.userId,
    );

    return successResponse(res, {
      message: "Booking completed successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markPatientNoShow = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const booking = await markPatientNoShowService(bookingId, req.user.userId);

    return successResponse(res, {
      message: "Patient marked as no-show successfully",
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};
