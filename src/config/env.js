import dotenv from "dotenv";

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV,

  PORT: Number(process.env.PORT),

  MONGODB_URI: process.env.MONGODB_URI,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,

  SMS_USERNAME: process.env.SMS_USERNAME,
  SMS_PASSWORD: process.env.SMS_PASSWORD,
  SMS_SENDER_NUMBER: process.env.SMS_SENDER_NUMBER,
  SMS_VERIFY_PATTERN_CODE: process.env.SMS_VERIFY_PATTERN_CODE,
  OTP_EXPIRE_SECONDS:Number(process.env.OTP_EXPIRE_SECONDS),

  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};

const requiredEnvVariables = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`,
    );
  }
}

export default env;