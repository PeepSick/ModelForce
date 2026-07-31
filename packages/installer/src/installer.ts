import { RegistryProvider } from "@modelforce/registry";
import { ArtifactType } from "@modelforce/core";
import { Puller, PullResult } from "./puller.js";

export interface InstallResult {
  id: string;
  version: string;
  path: string;
  activated: boolean;
}

export interface InstallationStatus {
  providers: InstalledArtifact[];
  models: InstalledArtifact[];
  voices: InstalledArtifact[];
  characters: InstalledArtifact[];
}

export interface InstalledArtifact {
  id: string;
  version: string;
  installed: boolean;
  activated: boolean;
}

export class Installer {
  private puller: Puller;
  private installPath: string;

  constructor(registry: RegistryProvider, cachePath: string, installPath: string) {
    this.puller = new Puller(registry, cachePath);
    this.installPath = installPath;
  }

  async pull(type: "provider" | "model" | "voice" | "character", id: string, version?: string): Promise<PullResult> {
    switch (type) {
      case "provider":
        return this.puller.pullProvider(id, version);
      case "model":
        return this.puller.pullArtifact("model", id, version);
      case "voice":
        return this.puller.pullVoice(id, version);
      case "character":
        return this.puller.pullCharacter(id, version);
      default:
        throw new Error("Unknown type: " + type);
    }
  }

  async install(type: "provider" | "model" | "voice" | "character", id: string): Promise<InstallResult> {
    return {
      id,
      version: "0.0.0",
      path: this.installPath + "/" + type + "s/" + id,
      activated: true,
    };
  }

  async uninstall(type: "provider" | "model" | "voice" | "character", id: string): Promise<void> {
    // TODO: Implement
  }

  async status(): Promise<InstallationStatus> {
    return {
      providers: [],
      models: [],
      voices: [],
      characters: [],
    };
  }
}