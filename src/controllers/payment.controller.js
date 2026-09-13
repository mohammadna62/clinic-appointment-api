import { successResponse } from "../helpers/response.js";

import {
  createPayment as createPaymentService,
  verifyPayment as verifyPaymentService,
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

export const zarinpalCallback = async (req, res, next) => {
  try {
    const { Authority, Status } = req.query;

    const result = await verifyPaymentService(
      Authority,
      Status,
    );

    return successResponse(res, {
      message: result.alreadyVerified
        ? "Payment was already verified"
        : "Payment verified successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};