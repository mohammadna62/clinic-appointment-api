
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

const { pingMock, redisInstance, RedisMock } = vi.hoisted(() => {
  const pingMock = vi.fn();
  const redisInstance = { ping: pingMock };
  const RedisMock = vi.fn(function () {
    return redisInstance;
  });

  return { pingMock, redisInstance, RedisMock };
});

vi.mock("ioredis", () => ({
  default: RedisMock,
}));

vi.mock("../src/config/env.js", () => ({
  default: {
    REDIS_URI: "redis://localhost:6379",
  },
}));

describe("Redis connection", () => {
  let connectRedis;
  let redis;

  beforeEach(async () => {
    vi.resetModules();
    RedisMock.mockClear();
    pingMock.mockReset();

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    ({ connectRedis, redis } = await import("../src/config/redis.js"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should connect to Redis and ping the server", async () => {
    pingMock.mockResolvedValueOnce("PONG");

    await connectRedis();

    expect(RedisMock).toHaveBeenCalledOnce();
    expect(RedisMock).toHaveBeenCalledWith(
      "redis://localhost:6379",
    );
    expect(pingMock).toHaveBeenCalledOnce();

    expect(console.log).toHaveBeenCalledWith(
      "[Redis] Redis connected successfully",
    );
  });

  it("should log the error and exit when Redis connection fails", async () => {
    const connectionError = new Error("Redis connection failed");
    pingMock.mockRejectedValueOnce(connectionError);

    vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    await expect(connectRedis()).rejects.toThrow(
      "process.exit called",
    );

    expect(RedisMock).toHaveBeenCalledOnce();
    expect(pingMock).toHaveBeenCalledOnce();

    expect(console.error).toHaveBeenCalledWith(
      "[Redis] Redis connection failed",
    );
    expect(console.error).toHaveBeenCalledWith(connectionError);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
