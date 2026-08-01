/**
 * @modelforce/server
 *
 * REST API server for text-to-speech synthesis.
 *
 * @example
 * ```typescript
 * import { ModelForceServer } from "@modelforce/server";
 *
 * const server = new ModelForceServer({ port: 3000 });
 * await server.start();
 * ```
 *
 * @packageDocumentation
 */

// Server
export { ModelForceServer } from "./server.js";

// Types
export type {
  ApiResponse,
  SynthesizeRequest,
  SynthesizeResponseData,
  VoiceData,
  ProviderData,
  HealthData,
  CharacterData,
  ServerConfig,
} from "./types.js";

export { DEFAULT_SERVER_CONFIG } from "./types.js";
