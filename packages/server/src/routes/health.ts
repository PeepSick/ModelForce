import type { FastifyInstance } from "fastify";
import type { ModelForceClient } from "@modelforce/sdk";
import type { ApiResponse, HealthData } from "../types.js";

export async function healthRoutes(app: FastifyInstance, client: ModelForceClient) {
  const startTime = Date.now();

  app.get("/api/health", async (request, reply) => {
    const requestId = crypto.randomUUID();

    try {
      const providers = ["piper", "kokoro", "xtts"] as const;
      const providerStatuses = [];

      for (const id of providers) {
        try {
          const info = await client.getProviderInfo(id);
          const health = await client.health(id);

          providerStatuses.push({
            id: info.id,
            name: info.name,
            version: info.version,
            status: health.status,
            capabilities: info.capabilities,
          });
        } catch {
          providerStatuses.push({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            version: "unknown",
            status: "unavailable" as const,
            capabilities: [],
          });
        }
      }

      const hasHealthy = providerStatuses.some((p) => p.status === "healthy");
      const hasDegraded = providerStatuses.some((p) => p.status === "degraded");

      let overallStatus: "healthy" | "degraded" | "unavailable";
      if (hasHealthy) {
        overallStatus = hasDegraded ? "degraded" : "healthy";
      } else {
        overallStatus = "unavailable";
      }

      const responseData: HealthData = {
        status: overallStatus,
        uptime: Math.floor((Date.now() - startTime) / 1000),
        version: "0.1.0",
        providers: providerStatuses,
      };

      const response: ApiResponse<HealthData> = {
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      const statusCode = overallStatus === "unavailable" ? 503 : 200;
      return reply.status(statusCode).send(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "HEALTH_CHECK_FAILED",
          message: errorMessage,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      return reply.status(500).send(response);
    }
  });
}
