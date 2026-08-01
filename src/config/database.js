import mongoose from "mongoose";
import env from "./env.js";

export async function connectDatabase() {
  console.log("[Database] Connecting to MongoDB...");

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("[Database] MongoDB connected successfully");
  } catch (error) {
    console.error("[Database] MongoDB connection failed");
    console.error(error);

    process.exit(1);
  }
}