import { redis } from "../config/redis.js";
import env from "../config/env.js";
import AppError from "../errors/app-error.js";

const OTP_RATE_LIMIT_PREFIX = "auth:otp:rate-limit";

export default async function otpRateLimit(req, res, next) {
  try {
    const ip = req.ip;

    const key = `${OTP_RATE_LIMIT_PREFIX}:${ip}`;

    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, env.OTP_RATE_LIMIT_WINDOW_SECONDS);
    }

    const remainingRequests = Math.max(
      env.OTP_RATE_LIMIT_MAX_REQUESTS - currentCount,
      0,
    );

    res.set(
      "X-RateLimit-Limit",
      env.OTP_RATE_LIMIT_MAX_REQUESTS.toString(),
    );

    res.set(
      "X-RateLimit-Remaining",
      remainingRequests.toString(),
    );

    if (currentCount > env.OTP_RATE_LIMIT_MAX_REQUESTS) {
      const retryAfter = await redis.ttl(key);

      res.set("Retry-After", retryAfter.toString());

      throw new AppError(
        "Too many OTP requests. Please try again later.",
        429,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}