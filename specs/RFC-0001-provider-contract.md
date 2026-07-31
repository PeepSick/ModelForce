# RFC-0001: Provider Contract

**Status:** Frozen
**Created:** 2026-07-31

---

## Purpose

Defines the contract that all TTS providers must implement. This is the foundation of the ModelForce Voice ecosystem.

---

## Provider Interface

`	ypescript
interface TTSProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;

  synthesize(text: string, options?: SynthesizeOptions): Promise<Buffer>;
  stream(text: string, options?: SynthesizeOptions): AsyncIterable<AudioChunk>;
  health(): Promise<HealthStatus>;
  voices(): Promise<VoiceInfo[]>;
  supports(capability: ProviderCapability): boolean;
}
`

---

## Types

### ProviderCapability

`	ypescript
type ProviderCapability =
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
`

### SynthesizeOptions

`	ypescript
interface SynthesizeOptions {
  text: string;
  voice?: string;
  format?: AudioFormat;
  sampleRate?: number;
  speed?: number;
  emotion?: string;
}

type AudioFormat = "pcm" | "mp3" | "wav" | "ogg";
`

### AudioChunk

`	ypescript
interface AudioChunk {
  data: Buffer;
  timestamp: number;
  sequence: number;
  isLast: boolean;
}
`

### HealthStatus

`	ypescript
interface HealthStatus {
  status: "healthy" | "degraded" | "unavailable";
  latency: number;
  lastCheck: Date;
  error?: string;
}
`

### VoiceInfo

`	ypescript
interface VoiceInfo {
  id: string;
  name: string;
  language: string;
  gender?: "female" | "male" | "neutral";
  preview?: string;
}
`

---

## Benchmark Result

`	ypescript
interface BenchmarkResult {
  provider: string;

  // Latency (ms)
  firstByteLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;

  // Throughput
  charsPerSecond: number;
  realtimeFactor: number;

  // Streaming
  streamStartup: number;
  streamChunkInterval: number;

  // Resources
  cpuUsage: number;
  memoryUsage: number;
  startupTime: number;

  // Environment
  timestamp: Date;
  hardware: string;
}
`

---

## Provider Metadata

`	ypescript
interface ProviderMeta {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  license: string;
  repository?: string;

  // Installation
  installCommand: string;
  dependencies: string[];

  // Security & Integrity
  checksum: string;
  signature?: string;
  minRuntimeVersion: string;
  apiVersion: string;

  // Requirements
  requirements: {
    os?: string[];
    cpu?: boolean;
    gpu?: boolean;
    ram?: string;
    python?: boolean;
    network?: boolean;
  };
}
`

---

## Provider Lifecycle

`
1. install    — Download and verify provider package
2. load       — Dynamic import of provider module
3. init       — Initialize provider (load model, etc.)
4. synthesize — Process text-to-speech requests
5. health     — Periodic health checks
6. unload     — Release resources
7. uninstall  — Remove provider package
`

---

## Error Codes

`	ypescript
enum ProviderError {
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
`

---

## Versioning

Provider versions follow semver: MAJOR.MINOR.PATCH

- MAJOR: Breaking changes to provider contract
- MINOR: New features, new voices, new capabilities
- PATCH: Bug fixes, performance improvements

---

## Validation

Runtime MUST validate provider compliance:

1. All required methods exist
2. Version satisfies minRuntimeVersion
3. Checksum matches registry
4. Required capabilities are supported

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial frozen version |
