import { successResponse } from "../helpers/response.js";

import {
  createPayment as createPaymentService,
  verifyPayment as verifyPaymentService,
  getAdminPayments as getAdminPaymentsService,
  getAdminPaymentById as getAdminPaymentByIdService,
} from "../services/payment.service.js";

import {
  refundPayment as refundPaymentService,
} from "../services/refund.service.js";

export const createPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.validated.params;

    const result = await createPaymentService(bookingId, req.user.userId);

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

    const result = await verifyPaymentService(Authority, Status);

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

export const getAdminPayments = async (req, res, next) => {
  try {
    const { page, limit, status } = req.validated.query;

    const result = await getAdminPaymentsService(
      page,
      limit,
      status,
    );

    return successResponse(res, {
      message: "Payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
export const getAdminPaymentById = async (req, res, next) => {
  try {
    const { paymentId } = req.validated.params;

    const payment = await getAdminPaymentByIdService(paymentId);

    return successResponse(res, {
      message: "Payment retrieved successfully",
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.validated.params;

    const payment = await refundPaymentService(paymentId);

    return successResponse(res, {
      message: "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};