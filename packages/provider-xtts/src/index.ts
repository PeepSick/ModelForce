// @modelforce/provider-xtts
// XTTS TTS Provider

export { XttsProvider } from "./xtts-provider.js";
export type { XttsProviderConfig } from "./xtts-provider.js";

export { XttsProcessAdapter, XttsHttpAdapter } from "./xtts-adapter.js";
export type { XttsProcessConfig, XttsHttpConfig } from "./xtts-adapter.js";

export type {
  XttsBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";
