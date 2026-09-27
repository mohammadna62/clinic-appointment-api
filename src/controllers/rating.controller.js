import { successResponse } from "../helpers/response.js";
import { createRating as createRatingService } from "../services/rating.service.js";

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