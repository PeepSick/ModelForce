import * as fs from "fs/promises";
import * as path from "path";
import { ArtifactMeta, ArtifactType } from "@modelforce/core";

export interface ArtifactStoreConfig {
  basePath: string;
}

export class ArtifactStore {
  private basePath: string;

  constructor(config: ArtifactStoreConfig) {
    this.basePath = config.basePath;
  }

  async get(type: ArtifactType, id: string): Promise<ArtifactMeta | null> {
    const manifestPath = path.join(this.basePath, type, id, "manifest.json");
    try {
      const data = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(data) as ArtifactMeta;
    } catch {
      return null;
    }
  }

  async list(type: ArtifactType): Promise<ArtifactMeta[]> {
    const typePath = path.join(this.basePath, type);
    try {
      const entries = await fs.readdir(typePath, { withFileTypes: true });
      const artifacts: ArtifactMeta[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const artifact = await this.get(type, entry.name);
          if (artifact) {
            artifacts.push(artifact);
          }
        }
      }

      return artifacts;
    } catch {
      return [];
    }
  }

  async save(type: ArtifactType, id: string, meta: ArtifactMeta, data: Buffer): Promise<void> {
    const artifactPath = path.join(this.basePath, type, id);
    await fs.mkdir(artifactPath, { recursive: true });

    await fs.writeFile(
      path.join(artifactPath, "manifest.json"),
      JSON.stringify(meta, null, 2)
    );

    await fs.writeFile(path.join(artifactPath, "artifact." + meta.format), data);
  }

  async remove(type: ArtifactType, id: string): Promise<void> {
    const artifactPath = path.join(this.basePath, type, id);
    await fs.rm(artifactPath, { recursive: true, force: true });
  }

  async exists(type: ArtifactType, id: string): Promise<boolean> {
    const manifestPath = path.join(this.basePath, type, id, "manifest.json");
    try {
      await fs.access(manifestPath);
      return true;
    } catch {
      return false;
    }
  }
}