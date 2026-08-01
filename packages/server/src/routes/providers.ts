import type { FastifyInstance } from "fastify";
import type { ModelForceClient } from "@modelforce/sdk";
import type { ApiResponse, ProviderData } from "../types.js";

export async function providersRoutes(app: FastifyInstance, client: ModelForceClient) {
  app.get("/api/providers", async (request, reply) => {
    const requestId = crypto.randomUUID();

    try {
      const providerIds = ["piper", "kokoro", "xtts"] as const;
      const providers: ProviderData[] = [];

      for (const id of providerIds) {
        try {
          const info = await client.getProviderInfo(id);
          const health = await client.health(id);

          providers.push({
            id: info.id,
            name: info.name,
            version: info.version,
            status: health.status,
            capabilities: info.capabilities,
          });
        } catch {
          // Provider not available
          providers.push({
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1),
            version: "unknown",
            status: "unavailable",
            capabilities: [],
          });
        }
      }

      const response: ApiResponse<ProviderData[]> = {
        success: true,
        data: providers,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      return reply.send(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "PROVIDERS_FAILED",
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

  app.get<{
    Params: { provider: string };
  }>("/api/providers/:provider", async (request, reply) => {
    const requestId = crypto.randomUUID();
    const { provider } = request.params;

    try {
      const info = await client.getProviderInfo(provider as never);
      const health = await client.health(provider as never);

      const responseData: ProviderData = {
        id: info.id,
        name: info.name,
        version: info.version,
        status: health.status,
        capabilities: info.capabilities,
      };

      const response: ApiResponse<ProviderData> = {
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      return reply.send(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "PROVIDER_FAILED",
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
