import type { FastifyInstance } from "fastify";
import type { ModelForceClient } from "@modelforce/sdk";
import type { SynthesizeRequest, ApiResponse, SynthesizeResponseData, ServerConfig } from "../types.js";

export async function synthesizeRoutes(app: FastifyInstance, client: ModelForceClient, config: ServerConfig) {
  app.post<{
    Body: SynthesizeRequest;
  }>("/api/synthesize", async (request, reply) => {
    const requestId = crypto.randomUUID();
    const { text, provider, voice, format, sampleRate, speed, emotion } = request.body;

    if (!text || typeof text !== "string") {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "INVALID_REQUEST",
          message: "Text is required and must be a string",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
      return reply.status(400).send(response);
    }

    if (text.length > 10000) {
      const response: ApiResponse<never> = {
        success: false,
        error: {
          code: "TEXT_TOO_LONG",
          message: "Text must be less than 10000 characters",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
      return reply.status(400).send(response);
    }

    try {
      const result = await client.synthesize(text, {
        provider: provider as never,
        voice,
        format: format as never,
        sampleRate,
        speed,
        emotion,
      });

      // Save audio file
      const filename = `${requestId}.${format || "wav"}`;
      const audioPath = `${config.storage.audioDir}/${filename}`;
      const { writeFile, mkdir } = await import("fs/promises");
      const { dirname } = await import("path");

      await mkdir(dirname(audioPath), { recursive: true });
      await writeFile(audioPath, result.audio);

      const responseData: SynthesizeResponseData = {
        audioUrl: `/audio/${filename}`,
        format: format || "wav",
        size: result.size,
        latency: result.latency,
        provider: result.provider,
        voice: voice || "default",
      };

      const response: ApiResponse<SynthesizeResponseData> = {
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
          code: "SYNTHESIS_FAILED",
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
