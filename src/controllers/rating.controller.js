import { successResponse } from "../helpers/response.js";

import {
  createRating as createRatingService,
  getDoctorRatings as getDoctorRatingsService,
  getAdminDoctorRatings as getAdminDoctorRatingsService,
  deleteRating as deleteRatingService,
} from "../services/rating.service.js";

export const createRating = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;
    const { rating, comment } = req.validated.body;

    const result = await createRatingService(
      bookingId,
      req.user.userId,
      rating,
      comment,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Rating created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctorRatings = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;
    const { page, limit } = req.validated.query;

    const result = await getDoctorRatingsService(
      doctorId,
      page,
      limit,
    );

    return successResponse(res, {
      message: "Doctor ratings retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDoctorRatings = async (req, res, next) => {
  try {
    const { doctorId } = req.validated.params;
    const { page, limit } = req.validated.query;

    const result = await getAdminDoctorRatingsService(
      doctorId,
      page,
      limit,
    );

    return successResponse(res, {
      message: "Doctor ratings retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRating = async (req, res, next) => {
  try {
    const { ratingId } = req.validated.params;

    const rating = await deleteRatingService(ratingId);

    return successResponse(res, {
      message: "Rating deleted successfully",
      data: rating,
    });
  } catch (error) {
    next(error);
  }
};