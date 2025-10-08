import "dotenv/config";
import http from "http";
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} (env=${process.env.NODE_ENV || "development"})`);
});

// graceful shutdown
const shutdown = async (signal: string) => {
  try {
    console.log(`Received ${signal}. Closing http server...`);
    server.close(async (err) => {
      if (err) {
        console.error("Error closing server:", err);
        process.exit(1);
      }
      try {
        // close prisma connection
        await prisma.$disconnect();
        console.log("Prisma disconnected.");
        process.exit(0);
      } catch (e) {
        console.error("Error during shutdown:", e);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error("Unexpected shutdown error:", e);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
