#!/usr/bin/env node

import { ModelForceServer } from "./server.js";
import type { ServerConfig } from "./types.js";

function parseArgs(args: string[]): Partial<ServerConfig> {
  const config: Partial<ServerConfig> = {};

  for (let i = 2; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "-p":
      case "--port":
        config.port = parseInt(args[++i], 10);
        break;
      case "-H":
      case "--host":
        config.host = args[++i];
        break;
      case "--api-key":
        config.auth = {
          enabled: true,
          apiKey: args[++i],
        };
        break;
      case "--cors":
        config.cors = {
          origin: args[++i],
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        };
        break;
      case "--max-requests":
        config.rateLimit = {
          max: parseInt(args[++i], 10),
          timeWindow: 60000,
        };
        break;
      case "-h":
      case "--help":
        console.log(`
ModelForce API Server

Usage: modelforce-serve [options]

Options:
  -p, --port <port>         Port number (default: 3000)
  -H, --host <host>         Host address (default: 0.0.0.0)
  --api-key <key>           Enable API key authentication
  --cors <origin>           CORS origin (default: *)
  --max-requests <n>        Max requests per minute (default: 100)
  -h, --help                Show this help message

Examples:
  modelforce-serve                          # Start with defaults
  modelforce-serve -p 8080                  # Start on port 8080
  modelforce-serve --api-key my-secret-key  # Enable auth
        `);
        process.exit(0);
    }
  }

  return config;
}

async function main() {
  const config = parseArgs(process.argv);
  const server = new ModelForceServer(config);

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await server.stop();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("\nShutting down...");
    await server.stop();
    process.exit(0);
  });

  try {
    await server.start();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
