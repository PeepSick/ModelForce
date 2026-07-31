// Voice Identity (engine-independent)
export interface VoiceIdentity {
  id: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  language: string;
  description?: string;
  tags?: string[];
}

// Voice Meta (for registry)
export interface VoiceMeta {
  id: string;
  version: string;
  apiVersion: string;
  minRuntime: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  language: string;
  description?: string;
  checksum: string;
  size: number;
  providers: string[];
}

// Voice Pack (full definition)
export interface VoicePackData {
  metadata: VoiceIdentity;
  providerMap: VoiceProviderMapping[];
  pronunciation?: VoicePronunciationRules;
  style?: VoiceStyleProfile;
}

// Provider Mapping (how voice maps to each engine)
export interface VoiceProviderMapping {
  providerId: string;
  voiceId: string;
  modelId?: string;
  variant?: string;
  config?: Record<string, unknown>;
}

// Pronunciation Rules
export interface VoicePronunciationRules {
  rules: Array<{
    pattern: string;
    replacement: string;
    language?: string;
  }>;
  phonemeMap?: Record<string, string>;
}

// Style Profile
export interface VoiceStyleProfile {
  defaultSpeed: number;
  defaultPitch: number;
  defaultVolume: number;
  emphasis?: string[];
  avoid?: string[];
}