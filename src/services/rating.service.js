import Rating from "../models/rating.model.js";
import Booking from "../models/booking.model.js";
import AppError from "../errors/app-error.js";

export async function createRating(
  bookingId,
  userId,
  ratingValue,
  comment = "",
) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.patient.toString() !== userId.toString()) {
    throw new AppError("You are not allowed to rate this booking", 403);
  }

  if (booking.status !== "completed") {
    throw new AppError("Only completed bookings can be rated", 409);
  }

  const existingRating = await Rating.findOne({
    booking: booking._id,
  });

  if (existingRating) {
    throw new AppError("A rating already exists for this booking", 409);
  }

  const rating = await Rating.create({
    booking: booking._id,
    patient: booking.patient,
    doctor: booking.doctor,
    rating: ratingValue,
    comment,
  });

  return rating;
}
