// Telemetry Configuration
export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  interval: number;
  include: TelemetryMetric[];
  exclude: string[];
}

// Telemetry Metric
export type TelemetryMetric =
  | "usage_stats"
  | "error_reports"
  | "performance_metrics"
  | "voice_data"
  | "character_data"
  | "user_content";

// Default Telemetry Config
export const DEFAULT_TELEMETRY_CONFIG: TelemetryConfig = {
  enabled: false,
  interval: 3600,
  include: ["usage_stats", "error_reports", "performance_metrics"],
  exclude: ["voice_data", "character_data", "user_content"],
};

// Telemetry Event
export interface TelemetryEvent {
  type: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

// Telemetry Data
export interface TelemetryData {
  events: TelemetryEvent[];
  metrics: Record<string, number>;
  timestamp: Date;
}
