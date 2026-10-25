
import { describe, it, expect, vi, beforeEach } from "vitest";

import otpRateLimit from "../src/middlewares/otp-rate-limit.middleware.js";
import { redis } from "../src/config/redis.js";
import env from "../src/config/env.js";

vi.mock("../src/config/redis.js", () => ({
  redis: {
    incr: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    OTP_RATE_LIMIT_WINDOW_SECONDS: 60,
    OTP_RATE_LIMIT_MAX_REQUESTS: 3,
  },
}));

describe("otpRateLimit middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      ip: "127.0.0.1",
    };

    res = {
      set: vi.fn(),
    };

    next = vi.fn();

    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);
    redis.ttl.mockResolvedValue(45);
  });

  it("should increment the Redis counter using the client IP", async () => {
    await otpRateLimit(req, res, next);

    expect(redis.incr).toHaveBeenCalledWith(
      "auth:otp:rate-limit:127.0.0.1",
    );
  });

  it("should set expiration when the counter is first created", async () => {
    redis.incr.mockResolvedValue(1);

    await otpRateLimit(req, res, next);

    expect(redis.expire).toHaveBeenCalledWith(
      "auth:otp:rate-limit:127.0.0.1",
      env.OTP_RATE_LIMIT_WINDOW_SECONDS,
    );
  });

  it("should not reset expiration for subsequent requests", async () => {
    redis.incr.mockResolvedValue(2);

    await otpRateLimit(req, res, next);

    expect(redis.expire).not.toHaveBeenCalled();
  });

  it("should set rate limit headers for an allowed request", async () => {
    redis.incr.mockResolvedValue(2);

    await otpRateLimit(req, res, next);

    expect(res.set).toHaveBeenCalledWith(
      "X-RateLimit-Limit",
      "3",
    );

    expect(res.set).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      "1",
    );
  });

  it("should call next() when the request limit has not been exceeded", async () => {
    redis.incr.mockResolvedValue(3);

    await otpRateLimit(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
    expect(redis.ttl).not.toHaveBeenCalled();
  });

  it("should return 429 when the request limit is exceeded", async () => {
    redis.incr.mockResolvedValue(4);

    await otpRateLimit(req, res, next);

    expect(redis.ttl).toHaveBeenCalledWith(
      "auth:otp:rate-limit:127.0.0.1",
    );

    expect(res.set).toHaveBeenCalledWith(
      "Retry-After",
      "45",
    );

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0][0];

    expect(error.message).toBe(
      "Too many OTP requests. Please try again later.",
    );
    expect(error.statusCode).toBe(429);
  });

  it("should set remaining requests to zero after exceeding the limit", async () => {
    redis.incr.mockResolvedValue(5);

    await otpRateLimit(req, res, next);

    expect(res.set).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      "0",
    );
  });

  it("should pass Redis errors to next()", async () => {
    const redisError = new Error("Redis connection failed");

    redis.incr.mockRejectedValue(redisError);

    await otpRateLimit(req, res, next);

    expect(next).toHaveBeenCalledWith(redisError);
  });

  it("should pass expiration errors to next()", async () => {
    const expirationError = new Error("Expiration failed");

    redis.expire.mockRejectedValue(expirationError);

    await otpRateLimit(req, res, next);

    expect(next).toHaveBeenCalledWith(expirationError);
  });

  it("should pass TTL errors to next()", async () => {
    const ttlError = new Error("TTL lookup failed");

    redis.incr.mockResolvedValue(4);
    redis.ttl.mockRejectedValue(ttlError);

    await otpRateLimit(req, res, next);

    expect(next).toHaveBeenCalledWith(ttlError);
  });
});
