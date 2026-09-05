import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string(),

  PORT: z.coerce.number(),

  MONGODB_URI: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  REFRESH_TOKEN_EXPIRE_SECONDS: z.coerce.number(),

  TOKEN_HASH_SECRET: z.string().min(1),

  OTP_EXPIRE_SECONDS: z.coerce.number(),

  SMS_USERNAME: z.string().optional(),
  SMS_PASSWORD: z.string().optional(),
  SMS_SENDER_NUMBER: z.string().optional(),
  SMS_VERIFY_PATTERN_CODE: z.string().optional(),
  PROJECT_TIME_ZONE: z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export default {
  ...parsedEnv,

  IS_DEVELOPMENT: parsedEnv.NODE_ENV === "development",
  IS_PRODUCTION: parsedEnv.NODE_ENV === "production",
};
