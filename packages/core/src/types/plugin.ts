// Plugin Types
export type PluginType = "tts" | "stt" | "llm" | "vision" | "ocr" | "tool" | "avatar";

// Plugin Config
export interface PluginConfig {
  registry?: string;
  offline?: boolean;
  priority?: number;
}

// Plugin Health
export interface PluginHealth {
  status: "healthy" | "degraded" | "unavailable";
  details?: string;
}

// Plugin Capability
export type PluginCapability = string;

// Plugin Interface
export interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly type: PluginType;
  readonly version: string;

  install(config?: PluginConfig): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  uninstall(): Promise<void>;

  health(): Promise<PluginHealth>;
  capabilities(): PluginCapability[];
}

// Plugin Metadata
export interface PluginMeta {
  id: string;
  name: string;
  type: PluginType;
  version: string;
  description: string;
  author: string;
  license: string;
  checksum: string;
  minRuntimeVersion: string;
  apiVersion: string;
}
