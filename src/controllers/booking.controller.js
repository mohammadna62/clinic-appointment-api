import { successResponse } from "../helpers/response.js";

import { createBooking as createBookingService } from "../services/booking.service.js";

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
