import {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";

export interface RegistryProvider {
  readonly id: string;
  readonly type: "remote" | "local" | "mirror";

  // Providers
  listProviders(): Promise<ProviderMeta[]>;
  getProvider(id: string, version?: string): Promise<ProviderMeta>;
  downloadProvider(id: string, version?: string): Promise<Buffer>;

  // Artifacts (generic)
  listArtifacts(type: ArtifactType, filter?: ArtifactFilter): Promise<ArtifactMeta[]>;
  getArtifact(type: ArtifactType, id: string, version?: string): Promise<ArtifactMeta>;
  downloadArtifact(type: ArtifactType, id: string, version?: string): Promise<Buffer>;

  // Voices (convenience methods)
  listVoices(): Promise<VoiceMeta[]>;
  getVoice(id: string, version?: string): Promise<VoiceMeta>;
  downloadVoice(id: string, version?: string): Promise<Buffer>;

  // Characters (convenience methods)
  listCharacters(): Promise<CharacterMeta[]>;
  getCharacter(id: string, version?: string): Promise<CharacterMeta>;
  downloadCharacter(id: string, version?: string): Promise<Buffer>;

  // Updates
  checkUpdates(): Promise<UpdateInfo[]>;
}

export interface UpdateInfo {
  type: "provider" | "model" | "voice" | "character";
  id: string;
  currentVersion: string;
  latestVersion: string;
}
