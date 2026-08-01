/**
 * @modelforce/sdk
 *
 * Simple API for text-to-speech synthesis.
 *
 * @example
 * ```typescript
 * import { ModelForceClient } from "@modelforce/sdk";
 *
 * const client = new ModelForceClient({ provider: "piper" });
 * const result = await client.synthesize("Hello world");
 * await client.writeFile("output.wav", result.audio);
 * ```
 *
 * @packageDocumentation
 */

// Client
export { ModelForceClient } from "./client.js";

// Types
export type {
  ProviderId,
  AudioFormat,
  VoiceGender,
  SynthesizeOptions,
  VoiceInfo,
  HealthStatus,
  SynthesizeResult,
  StreamChunk,
  BenchmarkResult,
  CharacterInfo,
  SDKConfig,
  SDKEvent,
} from "./types.js";
