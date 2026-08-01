import env from "./src/config/env.js";
import app from "./src/app.js";
import { connectDatabase } from "./src/config/database.js";
import {connectRedis} from "./src/config/redis.js"

console.log("[Bootstrap] server.js started");

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

  await connectDatabase();
  await connectRedis();

  startServer();

  console.log("[Bootstrap] Application bootstrap finished");
}

bootstrap();