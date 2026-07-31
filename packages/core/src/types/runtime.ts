// Runtime Configuration
export interface RuntimeConfig {
  // Queue
  maxQueueSize: number;
  queueTimeout: number;

  // Concurrency
  maxConcurrent: number;
  maxPerProvider: number;

  // Priority
  priorityLevels: {
    realtime: number;
    streaming: number;
    batch: number;
    background: number;
  };

  // Cancellation
  allowCancellation: boolean;
  cancellationTimeout: number;

  // Timeout
  synthesisTimeout: number;
  streamTimeout: number;

  // Retry
  maxRetries: number;
  retryDelay: number;
  retryBackoff: "linear" | "exponential";
}

// Default Runtime Config
export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  maxQueueSize: 1000,
  queueTimeout: 30000,
  maxConcurrent: 50,
  maxPerProvider: 10,
  priorityLevels: {
    realtime: 0,
    streaming: 1,
    batch: 2,
    background: 3,
  },
  allowCancellation: true,
  cancellationTimeout: 5000,
  synthesisTimeout: 30000,
  streamTimeout: 60000,
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: "exponential",
};

// Request Priority
export type RequestPriority = "realtime" | "streaming" | "batch" | "background";

// Synthesis Request
export interface SynthesisRequest {
  id: string;
  text: string;
  provider?: string;
  voice?: string;
  priority: RequestPriority;
  timestamp: Date;
}

// Synthesis Result
export interface SynthesisResult {
  id: string;
  audio: Buffer;
  provider: string;
  latency: number;
  timestamp: Date;
}

// Stream Request
export interface StreamRequest {
  id: string;
  text: string;
  provider?: string;
  voice?: string;
  priority: RequestPriority;
  timestamp: Date;
  abortController?: AbortController;
}

// Stream Chunk
export interface StreamChunk {
  data: Buffer;
  timestamp: number;
  sequence: number;
  isLast: boolean;
}

// Queue Status
export interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  byProvider: Record<string, number>;
}

// Runtime Metrics
export interface RuntimeMetrics {
  avgLatency: number;
  p95Latency: number;
  throughput: number;
  uptime: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

// Runtime Policy
export type RuntimePolicy = "offline-first" | "quality-first" | "latency-first" | "cpu-only";
