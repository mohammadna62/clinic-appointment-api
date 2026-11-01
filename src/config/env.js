import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
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
    OTP_RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().positive(),
    OTP_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive(),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
    OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive(),

    // OTP Delivery
    OTP_DELIVERY_MODE: z.enum(["console", "provider"]).default("console"),

    // SMS Provider (IPPanel)
    SMS_USERNAME: z.string().trim().min(1).optional(),
    SMS_PASSWORD: z.string().trim().min(1).optional(),
    SMS_SENDER_NUMBER: z.string().trim().min(1).optional(),
    SMS_VERIFY_PATTERN_CODE: z.string().trim().min(1).optional(),

    // ZarinPal
    ZARINPAL_MERCHANT_ID: z.string().min(1),
    ZARINPAL_PAYMENT_CALLBACK_URL: z.string().url(),
    ZARINPAL_PAYMENT_BASE_URL: z.string().url(),
    ZARINPAL_API_BASE_URL: z.string().url(),

    // Time Zone
    PROJECT_TIME_ZONE: z.string(),

    // AI Assistant
    AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default("gpt-6-luna"),
  })
  .superRefine((data, ctx) => {
    if (
      data.OTP_DELIVERY_MODE === "console" &&
      !["development", "test"].includes(data.NODE_ENV)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["OTP_DELIVERY_MODE"],
        message: "Console OTP delivery is allowed only in development and test environments",
      });
    }

    if (data.OTP_DELIVERY_MODE === "provider") {
      const requiredSmsVariables = [
        "SMS_USERNAME",
        "SMS_PASSWORD",
        "SMS_SENDER_NUMBER",
        "SMS_VERIFY_PATTERN_CODE",
      ];

      for (const variable of requiredSmsVariables) {
        if (!data[variable]) {
          ctx.addIssue({
            code: "custom",
            path: [variable],
            message: `${variable} is required when OTP_DELIVERY_MODE is provider`,
          });
        }
      }
    }

    if (data.AI_PROVIDER === "openai" && !data.OPENAI_API_KEY) {
      ctx.addIssue({
        code: "custom",
        path: ["OPENAI_API_KEY"],
        message: "OPENAI_API_KEY is required when AI_PROVIDER is openai",
      });
    }
  });

const parsedEnv = envSchema.parse(process.env);

export default {
  ...parsedEnv,
  IS_DEVELOPMENT: parsedEnv.NODE_ENV === "development",
  IS_PRODUCTION: parsedEnv.NODE_ENV === "production",
};
