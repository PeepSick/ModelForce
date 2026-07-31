import {
  ProviderMeta,
  ArtifactMeta,
  ArtifactType,
  ArtifactFilter,
  VoiceMeta,
  CharacterMeta,
} from "@modelforce/core";
import { RegistryProvider, UpdateInfo } from "./registry-provider.js";

export class MirrorRegistry implements RegistryProvider {
  readonly type = "mirror" as const;
  private primary: RegistryProvider;
  private fallback: RegistryProvider;

  constructor(id: string, primary: RegistryProvider, fallback: RegistryProvider) {
    this.id = id;
    this.primary = primary;
    this.fallback = fallback;
  }

  readonly id: string;

  async listProviders(): Promise<ProviderMeta[]> {
    try {
      return await this.primary.listProviders();
    } catch {
      return await this.fallback.listProviders();
    }
  }

  async getProvider(id: string, version?: string): Promise<ProviderMeta> {
    try {
      return await this.primary.getProvider(id, version);
    } catch {
      return await this.fallback.getProvider(id, version);
    }
  }

  async downloadProvider(id: string, version?: string): Promise<Buffer> {
    try {
      return await this.primary.downloadProvider(id, version);
    } catch {
      return await this.fallback.downloadProvider(id, version);
    }
  }

  async listArtifacts(type: ArtifactType, filter?: ArtifactFilter): Promise<ArtifactMeta[]> {
    try {
      return await this.primary.listArtifacts(type, filter);
    } catch {
      return await this.fallback.listArtifacts(type, filter);
    }
  }

  async getArtifact(type: ArtifactType, id: string, version?: string): Promise<ArtifactMeta> {
    try {
      return await this.primary.getArtifact(type, id, version);
    } catch {
      return await this.fallback.getArtifact(type, id, version);
    }
  }

  async downloadArtifact(type: ArtifactType, id: string, version?: string): Promise<Buffer> {
    try {
      return await this.primary.downloadArtifact(type, id, version);
    } catch {
      return await this.fallback.downloadArtifact(type, id, version);
    }
  }

  async listVoices(): Promise<VoiceMeta[]> {
    try {
      return await this.primary.listVoices();
    } catch {
      return await this.fallback.listVoices();
    }
  }

  async getVoice(id: string, version?: string): Promise<VoiceMeta> {
    try {
      return await this.primary.getVoice(id, version);
    } catch {
      return await this.fallback.getVoice(id, version);
    }
  }

  async downloadVoice(id: string, version?: string): Promise<Buffer> {
    try {
      return await this.primary.downloadVoice(id, version);
    } catch {
      return await this.fallback.downloadVoice(id, version);
    }
  }

  async listCharacters(): Promise<CharacterMeta[]> {
    try {
      return await this.primary.listCharacters();
    } catch {
      return await this.fallback.listCharacters();
    }
  }

  async getCharacter(id: string, version?: string): Promise<CharacterMeta> {
    try {
      return await this.primary.getCharacter(id, version);
    } catch {
      return await this.fallback.getCharacter(id, version);
    }
  }

  async downloadCharacter(id: string, version?: string): Promise<Buffer> {
    try {
      return await this.primary.downloadCharacter(id, version);
    } catch {
      return await this.fallback.downloadCharacter(id, version);
    }
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    try {
      return await this.primary.checkUpdates();
    } catch {
      return await this.fallback.checkUpdates();
    }
  }
}
