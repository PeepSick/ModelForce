// Artifact Types
export type ArtifactType = "model" | "voice" | "character" | "prompt" | "skill" | "avatar" | "plugin";

// Artifact Metadata
export interface ArtifactMeta {
  id: string;
  type: ArtifactType;
  version: string;
  apiVersion: string;
  minRuntime: string;
  checksum: string;
  size: number;
  format: string;
  tags?: string[];
  dependencies?: ArtifactDependency[];
}

// Artifact Dependency
export interface ArtifactDependency {
  id: string;
  type: ArtifactType;
  version: string;
  optional?: boolean;
}

// Artifact Filter
export interface ArtifactFilter {
  type?: ArtifactType;
  tags?: string[];
  language?: string;
  provider?: string;
}

// Model Metadata (extends ArtifactMeta)
export interface ModelMeta extends ArtifactMeta {
  type: "model";
  providerId: string;
  language: string;
  gender?: "female" | "male" | "neutral";
  quality: "low" | "medium" | "high";
  requirements: {
    ram: string;
    gpu?: boolean;
  };
}

// Voice Pack
export interface VoicePack {
  id: string;
  version: string;
  apiVersion: string;
  minRuntime: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  language: string;
  description?: string;
  providerMap: Record<string, ProviderMapping>;
  pronunciation?: PronunciationRules;
  style?: StyleProfile;
}

// Provider Mapping
export interface ProviderMapping {
  voiceId: string;
  modelId?: string;
  variant?: string;
  config?: Record<string, unknown>;
}

// Pronunciation Rules
export interface PronunciationRules {
  rules: Array<{
    pattern: string;
    replacement: string;
    language?: string;
  }>;
  phonemeMap?: Record<string, string>;
}

// Style Profile
export interface StyleProfile {
  defaultSpeed: number;
  defaultPitch: number;
  defaultVolume: number;
  emphasis?: string[];
  avoid?: string[];
}
