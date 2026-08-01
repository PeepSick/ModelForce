/**
 * @modelforce/server - API Types
 *
 * Request/response types for the REST API.
 */

/** API Response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/** Synthesize request body */
export interface SynthesizeRequest {
  text: string;
  provider?: string;
  voice?: string;
  format?: "wav" | "mp3" | "pcm" | "ogg";
  sampleRate?: number;
  speed?: number;
  emotion?: string;
}

/** Synthesize response data */
export interface SynthesizeResponseData {
  audioUrl: string;
  format: string;
  size: number;
  latency: number;
  provider: string;
  voice: string;
}

/** Voice response data */
export interface VoiceData {
  id: string;
  name: string;
  language: string;
  gender?: string;
  provider: string;
}

/** Provider response data */
export interface ProviderData {
  id: string;
  name: string;
  version: string;
  status: "healthy" | "degraded" | "unavailable";
  capabilities: string[];
}

/** Health response data */
export interface HealthData {
  status: "healthy" | "degraded" | "unavailable";
  uptime: number;
  version: string;
  providers: ProviderData[];
}

/** Character response data */
export interface CharacterData {
  id: string;
  displayName: string;
  description: string;
  voice: string;
}

/** Server configuration */
export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    methods: string[];
  };
  rateLimit: {
    max: number;
    timeWindow: number;
  };
  auth: {
    apiKey?: string;
    enabled: boolean;
  };
  storage: {
    audioDir: string;
    maxFileSize: number;
  };
}

/** Default server config */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3000,
  host: "0.0.0.0",
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
  rateLimit: {
    max: 100,
    timeWindow: 60000,
  },
  auth: {
    enabled: false,
  },
  storage: {
    audioDir: "./audio",
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
};
