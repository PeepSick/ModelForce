import * as fs from "fs/promises";
import * as path from "path";
import {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";
import { RegistryProvider, UpdateInfo } from "./registry-provider.js";

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

  async getProvider(id: string, version?: string): Promise<ProviderMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadProvider(id: string, version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listArtifacts(type: ArtifactType, filter?: ArtifactFilter): Promise<ArtifactMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getArtifact(type: ArtifactType, id: string, version?: string): Promise<ArtifactMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadArtifact(type: ArtifactType, id: string, version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listVoices(): Promise<VoiceMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getVoice(id: string, version?: string): Promise<VoiceMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadVoice(id: string, version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async getCharacter(id: string, version?: string): Promise<CharacterMeta> {
    // TODO: Read from local filesystem
    throw new Error("Not implemented");
  }

  async downloadCharacter(id: string, version?: string): Promise<Buffer> {
    // Local registry already has files, just read them
    throw new Error("Not implemented");
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    // Local registry doesn't have updates
    return [];
  }
}
