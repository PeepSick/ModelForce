import type {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";
import type { RegistryProvider, UpdateInfo } from "./registry-provider.js";

export class RemoteRegistry implements RegistryProvider {
  readonly type = "remote" as const;
  private baseUrl: string;

  constructor(id: string, baseUrl: string) {
    this.id = id;
    this.baseUrl = baseUrl;
  }

  readonly id: string;

  async listProviders(): Promise<ProviderMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getProvider(_id: string, _version?: string): Promise<ProviderMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadProvider(_id: string, _version?: string): Promise<Buffer> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async listArtifacts(_type: ArtifactType, _filter?: ArtifactFilter): Promise<ArtifactMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getArtifact(_type: ArtifactType, _id: string, _version?: string): Promise<ArtifactMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadArtifact(_type: ArtifactType, _id: string, _version?: string): Promise<Buffer> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async listVoices(): Promise<VoiceMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getVoice(_id: string, _version?: string): Promise<VoiceMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadVoice(_id: string, _version?: string): Promise<Buffer> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getCharacter(_id: string, _version?: string): Promise<CharacterMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadCharacter(_id: string, _version?: string): Promise<Buffer> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    // TODO: Implement HTTP fetch
    return [];
  }
}
