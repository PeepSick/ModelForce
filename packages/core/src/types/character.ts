// Character (full agent)
export interface Character {
  id: string;
  version: string;
  apiVersion: string;
  minRuntime: string;
  displayName: string;
  description: string;
  author?: string;

  // Voice reference
  voice: string;
  voiceOverrides?: VoiceOverrides;

  // Persona
  persona: PersonaProfile;

  // Skills
  skills: SkillProfile;

  // Tool Permissions
  tools: ToolPermissions;

  // Avatar
  avatar?: AvatarProfile;

  // Memory
  memory?: MemoryProfile;
}

// Voice Overrides
export interface VoiceOverrides {
  speed?: number;
  pitch?: number;
  emotion?: string;
}

// Persona Profile
export interface PersonaProfile {
  traits: string[];
  tone: string;
  formality: "casual" | "neutral" | "formal";
  energy: "low" | "medium" | "high";
  systemPrompt: string;
  greeting?: string;
  farewell?: string;
  styleGuide?: string;
}

// Skill Profile
export interface SkillProfile {
  skills: Skill[];
}

// Skill
export interface Skill {
  id: string;
  name: string;
  description: string;
  prompt: string;
  requiredTools?: string[];
}

// Tool Permissions
export interface ToolPermissions {
  allow: string[];
  deny: string[];
  custom?: Record<string, ToolConfig>;
}

// Tool Config
export interface ToolConfig {
  enabled: boolean;
  config?: Record<string, unknown>;
}

// Avatar Profile
export interface AvatarProfile {
  model?: string;
  images?: string[];
  expressions?: string[];
  animations?: string[];
}

// Memory Profile
export interface MemoryProfile {
  shortTermCapacity: number;
  longTermEnabled: boolean;
  contextWindow: number;
  summaryStyle: "detailed" | "compact";
}

// Character Meta (for registry)
export interface CharacterMeta {
  id: string;
  version: string;
  apiVersion: string;
  minRuntime: string;
  displayName: string;
  description: string;
  checksum: string;
  size: number;
  voice: string;
  skills: string[];
}
