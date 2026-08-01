/**
 * @modelforce/sdk - Public Types
 *
 * Clean, simple types for the ModelForce SDK.
 * These hide internal complexity and provide a stable API.
 */

/** Supported TTS providers */
export type ProviderId = "piper" | "kokoro" | "xtts";

/** Audio output format */
export type AudioFormat = "wav" | "mp3" | "pcm" | "ogg";

/** Voice gender */
export type VoiceGender = "female" | "male" | "neutral";

/** Synthesize options */
export interface SynthesizeOptions {
  /** Voice ID (e.g., "piper/en_US-lessac-medium") */
  voice?: string;

  /** Provider to use (defaults to configured provider) */
  provider?: ProviderId;

  /** Output audio format */
  format?: AudioFormat;

  /** Sample rate in Hz */
  sampleRate?: number;

  /** Speech speed (0.5 = slow, 1.0 = normal, 2.0 = fast) */
  speed?: number;

  /** Emotion (provider-specific) */
  emotion?: string;

  /** Output file path (if not provided, returns buffer) */
  outputPath?: string;
}

/** Voice information */
export interface VoiceInfo {
  /** Voice ID */
  id: string;

  /** Display name */
  name: string;

  /** Language code (e.g., "en-US", "tr-TR") */
  language: string;

  /** Voice gender */
  gender?: VoiceGender;

  /** Preview audio URL */
  preview?: string;
}

/** Provider health status */
export interface HealthStatus {
  /** Overall status */
  status: "healthy" | "degraded" | "unavailable";

  /** Latency in ms */
  latency: number;

  /** Last check time */
  lastCheck: Date;

  /** Error message (if any) */
  error?: string;
}

/** Synthesize result */
export interface SynthesizeResult {
  /** Audio buffer */
  audio: Buffer;

  /** Provider used */
  provider: ProviderId;

  /** Latency in ms */
  latency: number;

  /** Audio size in bytes */
  size: number;
}

/** Stream chunk */
export interface StreamChunk {
  /** Audio data */
  data: Buffer;

  /** Timestamp */
  timestamp: number;

  /** Sequence number */
  sequence: number;

  /** Is this the last chunk? */
  isLast: boolean;
}

/** Benchmark result */
export interface BenchmarkResult {
  /** Provider tested */
  provider: ProviderId;

  /** First byte latency */
  firstByteLatency: number;

  /** P50 latency */
  p50Latency: number;

  /** P95 latency */
  p95Latency: number;

  /** P99 latency */
  p99Latency: number;

  /** Characters per second */
  charsPerSecond: number;

  /** Realtime factor (1.0 = real-time) */
  realtimeFactor: number;

  /** CPU usage percentage */
  cpuUsage: number;

  /** Memory usage in MB */
  memoryUsage: number;

  /** Startup time in ms */
  startupTime: number;
}

/** Character information */
export interface CharacterInfo {
  /** Character ID */
  id: string;

  /** Display name */
  displayName: string;

  /** Description */
  description: string;

  /** Voice ID */
  voice: string;

  /** Personality traits */
  traits: string[];

  /** Speaking tone */
  tone: string;
}

/** SDK Configuration */
export interface SDKConfig {
  /** Default provider */
  provider?: ProviderId;

  /** Default voice */
  voice?: string;

  /** API key (for future cloud features) */
  apiKey?: string;

  /** Base URL (for future server mode) */
  baseUrl?: string;

  /** Timeout in ms */
  timeout?: number;

  /** Enable debug logging */
  debug?: boolean;
}

/** Event types */
export type SDKEvent =
  | { type: "synthesize:start"; text: string; provider: ProviderId }
  | { type: "synthesize:complete"; latency: number; size: number }
  | { type: "synthesize:error"; error: string }
  | { type: "health:check"; status: HealthStatus }
  | { type: "voice:list"; count: number };
