import type {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";
import type { RegistryProvider, UpdateInfo } from "./registry-provider.js";

export class LocalRegistry implements RegistryProvider {
  readonly type = "local" as const;
  private basePath: string;

  constructor(id: string, basePath: string) {
    this.id = id;
    this.basePath = basePath;
  }

  readonly id: string;

  async listProviders(): Promise<ProviderMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getProvider(_id: string, _version?: string): Promise<ProviderMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadProvider(_id: string, _version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listArtifacts(_type: ArtifactType, _filter?: ArtifactFilter): Promise<ArtifactMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getArtifact(_type: ArtifactType, _id: string, _version?: string): Promise<ArtifactMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadArtifact(_type: ArtifactType, _id: string, _version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listVoices(): Promise<VoiceMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getVoice(_id: string, _version?: string): Promise<VoiceMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadVoice(_id: string, _version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getCharacter(_id: string, _version?: string): Promise<CharacterMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadCharacter(_id: string, _version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    // Local registry doesn't have updates
    return [];
  }
}
