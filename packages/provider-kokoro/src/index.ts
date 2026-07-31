// @modelforce/provider-kokoro
// Kokoro TTS Provider

export { KokoroProvider } from "./kokoro-provider.js";
export type { KokoroProviderConfig } from "./kokoro-provider.js";

export { KokoroProcessAdapter } from "./kokoro-adapter.js";
export type { KokoroProcessConfig } from "./kokoro-adapter.js";

export type {
  KokoroBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";
