import axios from "axios";
import env from "../config/env.js";

const SMS_API_URL = "http://ippanel.com/api/select";

async function sendSmsWithProvider(phone, otp) {
  const payload = {
    op: "pattern",
    user: env.SMS_USERNAME,
    pass: env.SMS_PASSWORD,
    fromNum: env.SMS_SENDER_NUMBER,
    toNum: phone,
    patternCode: env.SMS_VERIFY_PATTERN_CODE,
    inputData: [
      {
        "verification-code": otp,
      },
    ],
  };

  const response = await axios.post(SMS_API_URL, payload, {
    timeout: 10000,
  });

  const body = response.data;

  const isSuccessful =
    body === 0 ||
    body === "0" ||
    (Array.isArray(body) && Number(body[0]) === 0);

  if (!isSuccessful) {
    throw new Error("SMS Provider rejected the OTP request");
  }

  return "OTP sent successfully";
}

export async function sendSms(phone, otp) {
  if (env.OTP_DELIVERY_MODE === "console") {
    if (!["development", "test"].includes(env.NODE_ENV)) {
      throw new Error(
        "Console SMS delivery is allowed only in development and test environments",
      );
    }

    console.log(`[SMS] OTP for ${phone}: ${otp}`);

    return;
  }

  if (env.OTP_DELIVERY_MODE === "provider") {
    return sendSmsWithProvider(phone, otp);
  }

  throw new Error("Unsupported OTP delivery mode");
}
