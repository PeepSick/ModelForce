import { RegistryProvider } from "@modelforce/registry";
import { ArtifactType, ProviderMeta, ArtifactMeta } from "@modelforce/core";
import { verifyChecksum } from "./checksum.js";

export interface PullResult {
  id: string;
  version: string;
  checksum: string;
  size: number;
  path: string;
}

export class Puller {
  private registry: RegistryProvider;
  private cachePath: string;

  constructor(registry: RegistryProvider, cachePath: string) {
    this.registry = registry;
    this.cachePath = cachePath;
  }

  async pullProvider(id: string, version?: string): Promise<PullResult> {
    const meta = await this.registry.getProvider(id, version);
    const data = await this.registry.downloadProvider(id, version);

    const valid = await verifyChecksum(data, meta.checksum);
    if (!valid) {
      throw new Error("Checksum mismatch for provider " + id);
    }

    return {
      id: meta.id,
      version: meta.version,
      checksum: meta.checksum,
      size: data.length,
      path: this.cachePath + "/providers/" + meta.id,
    };
  }

  async pullArtifact(type: ArtifactType, id: string, version?: string): Promise<PullResult> {
    const meta = await this.registry.getArtifact(type, id, version);
    const data = await this.registry.downloadArtifact(type, id, version);

    const valid = await verifyChecksum(data, meta.checksum);
    if (!valid) {
      throw new Error("Checksum mismatch for " + type + " " + id);
    }

    return {
      id: meta.id,
      version: meta.version,
      checksum: meta.checksum,
      size: data.length,
      path: this.cachePath + "/" + type + "s/" + meta.id,
    };
  }

  async pullVoice(id: string, version?: string): Promise<PullResult> {
    const meta = await this.registry.getVoice(id, version);
    const data = await this.registry.downloadVoice(id, version);

    const valid = await verifyChecksum(data, meta.checksum);
    if (!valid) {
      throw new Error("Checksum mismatch for voice " + id);
    }

    return {
      id: meta.id,
      version: meta.version,
      checksum: meta.checksum,
      size: data.length,
      path: this.cachePath + "/voices/" + meta.id,
    };
  }

  async pullCharacter(id: string, version?: string): Promise<PullResult> {
    const meta = await this.registry.getCharacter(id, version);
    const data = await this.registry.downloadCharacter(id, version);

    const valid = await verifyChecksum(data, meta.checksum);
    if (!valid) {
      throw new Error("Checksum mismatch for character " + id);
    }

    return {
      id: meta.id,
      version: meta.version,
      checksum: meta.checksum,
      size: data.length,
      path: this.cachePath + "/characters/" + meta.id,
    };
  }
}