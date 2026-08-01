import mongoose from "mongoose";

import env from "./src/config/env.js";
import app from "./src/app.js";

console.log("[Bootstrap] server.js started");

async function connectToDatabase() {
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

function startServer() {
  console.log("[Server] Starting HTTP server...");

  app.listen(env.PORT, () => {
    console.log(
      `[Server] Server is running on http://localhost:${env.PORT} | Mode: ${env.NODE_ENV}`
    );
  });
}

async function bootstrap() {
  console.log("[Bootstrap] Application bootstrap started");

  await connectToDatabase();

  startServer();

  console.log("[Bootstrap]  Application bootstrap finished");
}

bootstrap();
