// Provider Capability Flags
export type ProviderCapability =
  | "streaming"
  | "offline"
  | "gpu"
  | "cpu-only"
  | "multi-speaker"
  | "ssml"
  | "emotion"
  | "speed"
  | "format-pcm"
  | "format-mp3"
  | "format-wav"
  | "format-ogg";

// Audio Format
export type AudioFormat = "pcm" | "mp3" | "wav" | "ogg";

// Synthesize Options
export interface SynthesizeOptions {
  voice?: string;
  format?: AudioFormat;
  sampleRate?: number;
  speed?: number;
  emotion?: string;
}

// Audio Chunk (for streaming)
export interface AudioChunk {
  data: Buffer;
  timestamp: number;
  sequence: number;
  isLast: boolean;
}

// Health Status
export interface HealthStatus {
  status: "healthy" | "degraded" | "unavailable";
  latency: number;
  lastCheck: Date;
  error?: string;
}

// Voice Info
export interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender?: "female" | "male" | "neutral";
  preview?: string;
}

// Benchmark Result
export interface BenchmarkResult {
  provider: string;

  firstByteLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;

  charsPerSecond: number;
  realtimeFactor: number;

  streamStartup: number;
  streamChunkInterval: number;

  cpuUsage: number;
  memoryUsage: number;
  startupTime: number;

  timestamp: Date;
  hardware: string;
}

// Provider Metadata
export interface ProviderMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository?: string;

  installCommand: string;
  dependencies: string[];

  checksum: string;
  signature?: string;
  minRuntimeVersion: string;
  apiVersion: string;

  requirements: {
    os?: string[];
    cpu?: boolean;
    gpu?: boolean;
    ram?: string;
    python?: boolean;
    network?: boolean;
  };
}

// TTS Provider Interface
export interface TTSProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  synthesize(text: string, options?: SynthesizeOptions): Promise<Buffer>;
  stream(text: string, options?: SynthesizeOptions): AsyncIterable<AudioChunk>;
  health(): Promise<HealthStatus>;
  voices(): Promise<VoiceInfo[]>;
  supports(capability: ProviderCapability): boolean;
}

// Provider Error Codes
export enum ProviderError {
  PROVIDER_NOT_FOUND = "PROVIDER_NOT_FOUND",
  PROVIDER_NOT_INSTALLED = "PROVIDER_NOT_INSTALLED",
  PROVIDER_LOAD_FAILED = "PROVIDER_LOAD_FAILED",
  PROVIDER_INIT_FAILED = "PROVIDER_INIT_FAILED",
  PROVIDER_UNHEALTHY = "PROVIDER_UNHEALTHY",
  PROVIDER_TIMEOUT = "PROVIDER_TIMEOUT",
  PROVIDER_BUSY = "PROVIDER_BUSY",
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",
  MODEL_LOAD_FAILED = "MODEL_LOAD_FAILED",
  VOICE_NOT_FOUND = "VOICE_NOT_FOUND",
  UNSUPPORTED_FORMAT = "UNSUPPORTED_FORMAT",
  CHECKSUM_MISMATCH = "CHECKSUM_MISMATCH",
  RUNTIME_VERSION_MISMATCH = "RUNTIME_VERSION_MISMATCH",
}