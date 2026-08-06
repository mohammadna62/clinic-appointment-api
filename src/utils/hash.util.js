import crypto from "crypto";
import env from "../config/env.js";

export function hashToken(token) {
  return crypto
    .createHmac("sha256", env.TOKEN_HASH_SECRET)
    .update(token)
    .digest("hex");
}

export function compareToken(token, storedHash) {
  const incomingHash = hashToken(token);

  return crypto.timingSafeEqual(
    Buffer.from(incomingHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
}