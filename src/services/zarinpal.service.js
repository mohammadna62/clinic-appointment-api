import axios from "axios";
import env from "../config/env.js";

const zarinpal = axios.create({
  baseURL: env.ZARINPAL_API_BASE_URL,
});

export async function createZarinpalPayment({
  amountInRial,
  description,
  mobile,
}) {
  try {
    const response = await zarinpal.post("/request.json", {
      merchant_id: env.ZARINPAL_MERCHANT_ID,
      callback_url: env.ZARINPAL_PAYMENT_CALLBACK_URL,
      amount: amountInRial,
      description,
      metadata: {
        mobile,
      },
    });

    const data = response.data.data;

    if (!data?.authority) {
      throw new Error("Zarinpal did not return an authority");
    }

    return {
      authority: data.authority,
      paymentUrl:
        env.ZARINPAL_PAYMENT_BASE_URL + data.authority,
    };
  } catch (error) {
    const message =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message;

    throw new Error(`Zarinpal payment request failed: ${message}`);
  }
}
export async function verifyZarinpalPayment({
  amountInRial,
  authority,
}) {
  try {
    const response = await zarinpal.post("/verify.json", {
      merchant_id: env.ZARINPAL_MERCHANT_ID,
      amount: amountInRial,
      authority,
    });

    const data = response.data.data;

    return {
      code: data.code,
      message: data.message,
      refId: data.ref_id,
    };
  } catch (error) {
    const message =
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.message ||
      error.message;

    throw new Error(`Zarinpal payment verification failed: ${message}`);
  }
}