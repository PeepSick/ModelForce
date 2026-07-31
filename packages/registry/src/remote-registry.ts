import {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";
import { RegistryProvider, UpdateInfo } from "./registry-provider.js";

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

  async getProvider(id: string, version?: string): Promise<ProviderMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadProvider(id: string, version?: string): Promise<Buffer> {
    // TODO: Implement HTTP download
    throw new Error("Not implemented");
  }

  async listArtifacts(type: ArtifactType, filter?: ArtifactFilter): Promise<ArtifactMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getArtifact(type: ArtifactType, id: string, version?: string): Promise<ArtifactMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadArtifact(type: ArtifactType, id: string, version?: string): Promise<Buffer> {
    // TODO: Implement HTTP download
    throw new Error("Not implemented");
  }

  async listVoices(): Promise<VoiceMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getVoice(id: string, version?: string): Promise<VoiceMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadVoice(id: string, version?: string): Promise<Buffer> {
    // TODO: Implement HTTP download
    throw new Error("Not implemented");
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async getCharacter(id: string, version?: string): Promise<CharacterMeta> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }

  async downloadCharacter(id: string, version?: string): Promise<Buffer> {
    // TODO: Implement HTTP download
    throw new Error("Not implemented");
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    // TODO: Implement HTTP fetch
    throw new Error("Not implemented");
  }
}
