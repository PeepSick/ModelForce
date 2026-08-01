import type { FastifyInstance } from "fastify";
import type { ModelForceClient } from "@modelforce/sdk";
import type { ApiResponse, VoiceData } from "../types.js";

export async function voicesRoutes(app: FastifyInstance, client: ModelForceClient) {
  app.get<{
    Querystring: { provider?: string };
  }>("/api/voices", async (request, reply) => {
    const requestId = crypto.randomUUID();
    const { provider } = request.query;

    try {
      const voices = await client.voices(provider as never);

      const responseData: VoiceData[] = voices.map((v) => ({
        id: v.id,
        name: v.name,
        language: v.language,
        gender: v.gender,
        provider: provider || "piper",
      }));

      const response: ApiResponse<VoiceData[]> = {
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
          code: "VOICES_FAILED",
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
    Params: { provider: string; voiceId: string };
  }>("/api/voices/:provider/:voiceId", async (request, reply) => {
    const requestId = crypto.randomUUID();
    const { provider, voiceId } = request.params;

    try {
      const voices = await client.voices(provider as never);
      const voice = voices.find((v) => v.id === voiceId);

      if (!voice) {
        const response: ApiResponse<never> = {
          success: false,
          error: {
            code: "VOICE_NOT_FOUND",
            message: `Voice "${voiceId}" not found in provider "${provider}"`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
        return reply.status(404).send(response);
      }

      const responseData: VoiceData = {
        id: voice.id,
        name: voice.name,
        language: voice.language,
        gender: voice.gender,
        provider,
      };

      const response: ApiResponse<VoiceData> = {
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
          code: "VOICE_FAILED",
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
