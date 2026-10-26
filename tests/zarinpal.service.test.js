
import { beforeEach, describe, expect, it, vi } from "vitest";

const { postMock, axiosCreateMock } = vi.hoisted(() => {
  const post = vi.fn();

  return {
    postMock: post,
    axiosCreateMock: vi.fn(() => ({
      post,
    })),
  };
});

vi.mock("axios", () => ({
  default: {
    create: axiosCreateMock,
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    ZARINPAL_API_BASE_URL: "https://api.zarinpal.test",
    ZARINPAL_MERCHANT_ID: "test-merchant-id",
    ZARINPAL_PAYMENT_CALLBACK_URL:
      "https://example.test/payment/callback",
    ZARINPAL_PAYMENT_BASE_URL: "https://payment.zarinpal.test/",
  },
}));

import {
  createZarinpalPayment,
  verifyZarinpalPayment,
} from "../src/services/zarinpal.service.js";



describe("Zarinpal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    axiosCreateMock.mockReturnValue({
      post: postMock,
    });
  });

  describe("createZarinpalPayment", () => {
    it("should create a payment and return authority and payment URL", async () => {
      postMock.mockResolvedValue({
        data: {
          data: {
            authority: "A00000000000000000000000000012345678",
          },
        },
      });

      const result = await createZarinpalPayment({
        amountInRial: 500000,
        description: "Clinic appointment payment",
        mobile: "09123456789",
      });

      expect(postMock).toHaveBeenCalledWith("/request.json", {
        merchant_id: "test-merchant-id",
        callback_url: "https://example.test/payment/callback",
        amount: 500000,
        description: "Clinic appointment payment",
        metadata: {
          mobile: "09123456789",
        },
      });

      expect(result).toEqual({
        authority: "A00000000000000000000000000012345678",
        paymentUrl:
          "https://payment.zarinpal.test/A00000000000000000000000000012345678",
      });
    });

    it("should throw an error when authority is missing", async () => {
      postMock.mockResolvedValue({
        data: {
          data: {},
        },
      });

      await expect(
        createZarinpalPayment({
          amountInRial: 500000,
          description: "Clinic appointment payment",
          mobile: "09123456789",
        }),
      ).rejects.toThrow(
        "Zarinpal payment request failed: Zarinpal did not return an authority",
      );
    });

    it("should throw an error when the response data is missing", async () => {
      postMock.mockResolvedValue({
        data: {},
      });

      await expect(
        createZarinpalPayment({
          amountInRial: 500000,
          description: "Clinic appointment payment",
          mobile: "09123456789",
        }),
      ).rejects.toThrow(
        "Zarinpal payment request failed: Zarinpal did not return an authority",
      );
    });

    it("should use the API error message when available", async () => {
      postMock.mockRejectedValue({
        response: {
          data: {
            errors: [
              {
                message: "Invalid merchant ID",
              },
            ],
          },
        },
        message: "Request failed",
      });

      await expect(
        createZarinpalPayment({
          amountInRial: 500000,
          description: "Clinic appointment payment",
          mobile: "09123456789",
        }),
      ).rejects.toThrow(
        "Zarinpal payment request failed: Invalid merchant ID",
      );
    });

    it("should use the API response message when no error details exist", async () => {
      postMock.mockRejectedValue({
        response: {
          data: {
            message: "Payment service unavailable",
          },
        },
        message: "Request failed",
      });

      await expect(
        createZarinpalPayment({
          amountInRial: 500000,
          description: "Clinic appointment payment",
          mobile: "09123456789",
        }),
      ).rejects.toThrow(
        "Zarinpal payment request failed: Payment service unavailable",
      );
    });

    it("should use the original error message as a fallback", async () => {
      postMock.mockRejectedValue(new Error("Network timeout"));

      await expect(
        createZarinpalPayment({
          amountInRial: 500000,
          description: "Clinic appointment payment",
          mobile: "09123456789",
        }),
      ).rejects.toThrow(
        "Zarinpal payment request failed: Network timeout",
      );
    });
  });

  describe("verifyZarinpalPayment", () => {
    it("should verify a payment and return the verification result", async () => {
      postMock.mockResolvedValue({
        data: {
          data: {
            code: 100,
            message: "Verified",
            ref_id: 123456789,
          },
        },
      });

      const result = await verifyZarinpalPayment({
        amountInRial: 500000,
        authority: "A00000000000000000000000000012345678",
      });

      expect(postMock).toHaveBeenCalledWith("/verify.json", {
        merchant_id: "test-merchant-id",
        amount: 500000,
        authority: "A00000000000000000000000000012345678",
      });

      expect(result).toEqual({
        code: 100,
        message: "Verified",
        refId: 123456789,
      });
    });

    it("should return the result even when the verification code is not 100", async () => {
      postMock.mockResolvedValue({
        data: {
          data: {
            code: -21,
            message: "Payment was not verified",
            ref_id: null,
          },
        },
      });

      const result = await verifyZarinpalPayment({
        amountInRial: 500000,
        authority: "A00000000000000000000000000012345678",
      });

      expect(result).toEqual({
        code: -21,
        message: "Payment was not verified",
        refId: null,
      });
    });

    it("should use the API error message when verification fails", async () => {
      postMock.mockRejectedValue({
        response: {
          data: {
            errors: [
              {
                message: "Invalid authority",
              },
            ],
          },
        },
        message: "Request failed",
      });

      await expect(
        verifyZarinpalPayment({
          amountInRial: 500000,
          authority: "invalid-authority",
        }),
      ).rejects.toThrow(
        "Zarinpal payment verification failed: Invalid authority",
      );
    });

    it("should use the API response message when verification error details are absent", async () => {
      postMock.mockRejectedValue({
        response: {
          data: {
            message: "Verification service unavailable",
          },
        },
        message: "Request failed",
      });

      await expect(
        verifyZarinpalPayment({
          amountInRial: 500000,
          authority: "A00000000000000000000000000012345678",
        }),
      ).rejects.toThrow(
        "Zarinpal payment verification failed: Verification service unavailable",
      );
    });

    it("should use the original error message as a fallback", async () => {
      postMock.mockRejectedValue(new Error("Network timeout"));

      await expect(
        verifyZarinpalPayment({
          amountInRial: 500000,
          authority: "A00000000000000000000000000012345678",
        }),
      ).rejects.toThrow(
        "Zarinpal payment verification failed: Network timeout",
      );
    });
  });
});
