import { successResponse } from "../helpers/response.js";

import {
  createPayment as createPaymentService,
} from "../services/payment.service.js";

export const createPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const result = await createPaymentService(
      bookingId,
      req.user.userId,
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Payment request created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};