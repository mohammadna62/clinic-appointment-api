import crypto from "crypto";

const mockPayments = new Map();

export async function createPayment({
  amountInRial,
  description,
  mobile,
}) {
  const authority = `MOCK-${crypto.randomBytes(16).toString("hex")}`;

  const payment = {
    authority,
    amountInRial,
    description,
    mobile,
    status: "pending",
    refId: null,
  };

  mockPayments.set(authority, payment);

  return {
    authority,
    paymentUrl: `/mock-payment/${authority}`,
  };
}

export async function verifyPayment({
  amountInRial,
  authority,
}) {
  const payment = mockPayments.get(authority);

  if (!payment) {
    return {
      code: -1,
      message: "Mock payment not found",
      refId: null,
    };
  }

  if (payment.amountInRial !== amountInRial) {
    return {
      code: -2,
      message: "Amount mismatch",
      refId: null,
    };
  }

  if (payment.status === "paid") {
    return {
      code: 101,
      message: "Payment already verified",
      refId: payment.refId,
    };
  }

  if (payment.status === "failed") {
    return {
      code: -3,
      message: "Payment failed",
      refId: null,
    };
  }

  payment.status = "paid";
  payment.refId = `MOCK-REF-${crypto.randomBytes(8).toString("hex")}`;

  mockPayments.set(authority, payment);

  return {
    code: 100,
    message: "Payment verified successfully",
    refId: payment.refId,
  };
}