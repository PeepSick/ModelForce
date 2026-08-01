import Fastify, { type FastifyRequest, type FastifyReply } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import { mkdir } from "fs/promises";
import { ModelForceClient } from "@modelforce/sdk";
import type { ServerConfig } from "./types.js";
import { DEFAULT_SERVER_CONFIG } from "./types.js";
import { synthesizeRoutes } from "./routes/synthesize.js";
import { voicesRoutes } from "./routes/voices.js";
import { providersRoutes } from "./routes/providers.js";
import { healthRoutes } from "./routes/health.js";

export class ModelForceServer {
  private app: ReturnType<typeof Fastify>;
  private client: ModelForceClient;
  private config: ServerConfig;
  private audioDir: string;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = { ...DEFAULT_SERVER_CONFIG, ...config };
    this.audioDir = this.config.storage.audioDir;

    this.app = Fastify({
      logger: {
        level: "info",
      },
    });

    this.client = new ModelForceClient({
      provider: "piper",
    });
  }

  async start(): Promise<void> {
    // Ensure audio directory exists
    await mkdir(this.audioDir, { recursive: true });

    // Setup CORS
    await this.app.register(cors, this.config.cors);

    // Setup rate limiting
    await this.app.register(rateLimit, {
      max: this.config.rateLimit.max,
      timeWindow: this.config.rateLimit.timeWindow,
    });

    // Auth middleware
    if (this.config.auth.enabled && this.config.auth.apiKey) {
      this.app.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
        const apiKey = request.headers["x-api-key"];
        if (apiKey !== this.config.auth.apiKey) {
          reply.status(401).send({
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "Invalid or missing API key",
            },
          });
        }
      });
    }

    // Static audio files
    await this.app.register(fastifyStatic, {
      root: this.audioDir,
      prefix: "/audio/",
      decorateReply: false,
    });

    // Register routes
    await this.app.register(async (app: ReturnType<typeof Fastify>) => {
      synthesizeRoutes(app, this.client, this.config);
      voicesRoutes(app, this.client);
      providersRoutes(app, this.client);
      healthRoutes(app, this.client);
    });

    // Root route
    this.app.get("/", async () => ({
      name: "ModelForce API",
      version: "0.1.0",
      description: "REST API for text-to-speech synthesis",
      docs: {
        health: "/api/health",
        synthesize: "/api/synthesize",
        voices: "/api/voices",
        providers: "/api/providers",
      },
    }));

    // Start server
    await this.app.listen({
      port: this.config.port,
      host: this.config.host,
    });

    console.log(`ModelForce API server running on http://${this.config.host}:${this.config.port}`);
  }

  async stop(): Promise<void> {
    await this.app.close();
  }

  getClient(): ModelForceClient {
    return this.client;
  }

  getConfig(): Readonly<ServerConfig> {
    return this.config;
  }
}
