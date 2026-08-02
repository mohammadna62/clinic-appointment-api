import crypto from "crypto";

export function generateOtp(length = 6) {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(crypto.randomInt(min, max));
}
