import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createPayment: vi.fn(),
  verifyPayment: vi.fn(),
  getAdminPayments: vi.fn(),
  getAdminPaymentById: vi.fn(),
  refundPayment: vi.fn(),
  successResponse: vi.fn(),
}));

vi.mock("../src/services/payment.service.js", () => ({
  createPayment: mocks.createPayment,
  verifyPayment: mocks.verifyPayment,
  getAdminPayments: mocks.getAdminPayments,
  getAdminPaymentById: mocks.getAdminPaymentById,
}));

vi.mock("../src/services/refund.service.js", () => ({
  refundPayment: mocks.refundPayment,
}));

vi.mock("../src/helpers/response.js", () => ({
  successResponse: mocks.successResponse,
}));

import {
  createPayment,
  zarinpalCallback,
  getAdminPayments,
  getAdminPaymentById,
  refundPayment,
} from "../src/controllers/payment.controller.js";

describe("Payment Controller", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        userId: "user-id",
      },
      params: {
        paymentId: "payment-id",
      },
      query: {
        Authority: "authority-token",
        Status: "OK",
      },
      validated: {
        params: {
          bookingId: "booking-id",
          paymentId: "payment-id",
        },
        query: {
          page: 1,
          limit: 10,
          status: "paid",
        },
      },
    };

    res = {};
    next = vi.fn();
  });

  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const result = {
        payment: { _id: "payment-id" },
        paymentUrl: "https://payment.example.com",
      };

      mocks.createPayment.mockResolvedValueOnce(result);

      await createPayment(req, res, next);

      expect(mocks.createPayment).toHaveBeenCalledWith(
        "booking-id",
        "user-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        statusCode: 201,
        message: "Payment request created successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Payment creation failed");

      mocks.createPayment.mockRejectedValueOnce(error);

      await createPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("zarinpalCallback", () => {
    it("should verify a payment successfully", async () => {
      const result = {
        alreadyVerified: false,
        payment: { _id: "payment-id" },
      };

      mocks.verifyPayment.mockResolvedValueOnce(result);

      await zarinpalCallback(req, res, next);

      expect(mocks.verifyPayment).toHaveBeenCalledWith(
        "authority-token",
        "OK",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Payment verified successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should return an already verified message when payment was verified before", async () => {
      const result = {
        alreadyVerified: true,
        payment: { _id: "payment-id" },
      };

      mocks.verifyPayment.mockResolvedValueOnce(result);

      await zarinpalCallback(req, res, next);

      expect(mocks.verifyPayment).toHaveBeenCalledWith(
        "authority-token",
        "OK",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Payment was already verified",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Payment verification failed");

      mocks.verifyPayment.mockRejectedValueOnce(error);

      await zarinpalCallback(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getAdminPayments", () => {
    it("should retrieve admin payments successfully", async () => {
      const result = {
        payments: [{ _id: "payment-id" }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      mocks.getAdminPayments.mockResolvedValueOnce(result);

      await getAdminPayments(req, res, next);

      expect(mocks.getAdminPayments).toHaveBeenCalledWith(
        1,
        10,
        "paid",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Payments retrieved successfully",
        data: result,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Payments retrieval failed");

      mocks.getAdminPayments.mockRejectedValueOnce(error);

      await getAdminPayments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("getAdminPaymentById", () => {
    it("should retrieve a payment by ID successfully", async () => {
      const payment = {
        _id: "payment-id",
        status: "paid",
      };

      mocks.getAdminPaymentById.mockResolvedValueOnce(payment);

      await getAdminPaymentById(req, res, next);

      expect(mocks.getAdminPaymentById).toHaveBeenCalledWith(
        "payment-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Payment retrieved successfully",
        data: { payment },
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Payment retrieval failed");

      mocks.getAdminPaymentById.mockRejectedValueOnce(error);

      await getAdminPaymentById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });

  describe("refundPayment", () => {
    it("should refund a payment successfully", async () => {
      const payment = {
        _id: "payment-id",
        status: "refunded",
      };

      mocks.refundPayment.mockResolvedValueOnce(payment);

      await refundPayment(req, res, next);

      expect(mocks.refundPayment).toHaveBeenCalledWith(
        "payment-id",
      );

      expect(mocks.successResponse).toHaveBeenCalledWith(res, {
        message: "Payment refunded successfully",
        data: payment,
      });

      expect(next).not.toHaveBeenCalled();
    });

    it("should pass errors to next", async () => {
      const error = new Error("Payment refund failed");

      mocks.refundPayment.mockRejectedValueOnce(error);

      await refundPayment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(mocks.successResponse).not.toHaveBeenCalled();
    });
  });
});