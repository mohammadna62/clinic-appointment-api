import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
import Booking from "../models/booking.model.js";
import Doctor from "../models/doctor.model.js";
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

export async function getDoctorRatingStats(doctorId) {
  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

  const result = await Rating.aggregate([
    {
      $match: {
        doctor: doctorObjectId,
      },
    },

    {
      $group: {
        _id: null,
        averageRating: {
          $avg: "$rating",
        },
        ratingCount: {
          $sum: 1,
        },

        oneStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
          },
        },

        twoStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
          },
        },

        threeStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
          },
        },

        fourStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
          },
        },

        fiveStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        averageRating: {
          $round: ["$averageRating", 2],
        },
        ratingCount: 1,
        distribution: {
          1: "$oneStar",
          2: "$twoStar",
          3: "$threeStar",
          4: "$fourStar",
          5: "$fiveStar",
        },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      ratingCount: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  return result[0];
}

export async function getDoctorRatings(doctorId, page, limit) {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const skip = (page - 1) * limit;

  const [ratings, total] = await Promise.all([
    Rating.find({
      doctor: doctorId,
    })
      .populate("patient", "firstName lastName")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Rating.countDocuments({
      doctor: doctorId,
    }),
  ]);

  return {
    ratings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAdminDoctorRatings(doctorId, page, limit) {
  const doctor = await Doctor.findById(doctorId)
    .populate("user", "firstName lastName")
    .populate("clinic", "name")
    .populate("specialty", "name");

  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const skip = (page - 1) * limit;

  const [ratings, total] = await Promise.all([
    Rating.find({
      doctor: doctorId,
    })
      .populate("patient", "firstName lastName")
      .populate("booking", "date startTime endTime status")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit),

    Rating.countDocuments({
      doctor: doctorId,
    }),
  ]);

  const statistics = await getDoctorRatingStats(doctorId);

  return {
    doctor,
    statistics,
    ratings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function deleteRating(ratingId) {
  const rating = await Rating.findById(ratingId);

  if (!rating) {
    throw new AppError("Rating not found", 404);
  }

  await rating.deleteOne();

  return rating;
}
