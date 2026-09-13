import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  // App
  NODE_ENV: z.string(),
  PORT: z.coerce.number(),

  // Database
  MONGODB_URI: z.string().min(1),

  // Redis
  REDIS_URI: z.string().min(1).optional(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  // Token / OTP
  REFRESH_TOKEN_EXPIRE_SECONDS: z.coerce.number(),
  TOKEN_HASH_SECRET: z.string().min(1),
  OTP_EXPIRE_SECONDS: z.coerce.number(),

  // SMS Panel
  SMS_USERNAME: z.string().optional(),
  SMS_PASSWORD: z.string().optional(),
  SMS_SENDER_NUMBER: z.string().optional(),
  SMS_VERIFY_PATTERN_CODE: z.string().optional(),

  // ZarinPal
  ZARINPAL_MERCHANT_ID: z.string().min(1),
  ZARINPAL_PAYMENT_CALLBACK_URL: z.string().url(),
  ZARINPAL_PAYMENT_BASE_URL: z.string().url(),
  ZARINPAL_API_BASE_URL: z.string().url(),
 
  // Time Zone
  PROJECT_TIME_ZONE: z.string(),
});

const parsedEnv = envSchema.parse(process.env);

export default {
  ...parsedEnv,

  IS_DEVELOPMENT: parsedEnv.NODE_ENV === "development",
  IS_PRODUCTION: parsedEnv.NODE_ENV === "production",
};