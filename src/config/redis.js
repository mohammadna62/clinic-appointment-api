import Redis from "ioredis";
import env from "./env.js";

let redis;

export async function connectRedis() {
  console.log("[Redis] Connecting...");

  try {
    redis = new Redis(env.REDIS_URI);

    await redis.ping();

    console.log("[Redis] Redis connected successfully");
  } catch (error) {
    console.error("[Redis] Redis connection failed");
    console.error(error);

    process.exit(1);
  }
}

export { redis };