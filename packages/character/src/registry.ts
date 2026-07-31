import { readdir, mkdir, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { CharacterLoader } from "./loader.js";
import { CharacterValidator } from "./validator.js";
import type { CharacterManifest, CharacterValidationResult } from "./manifest.js";

export interface CharacterRegistryEntry {
  id: string;
  path: string;
  manifest?: CharacterManifest;
  installed: boolean;
}

export class CharacterRegistry {
  private readonly charactersDir: string;
  private readonly loader: CharacterLoader;
  private readonly validator: CharacterValidator;

  constructor(charactersDir: string) {
    this.charactersDir = charactersDir;
    this.loader = new CharacterLoader(charactersDir);
    this.validator = new CharacterValidator(charactersDir);
  }

  async list(): Promise<CharacterRegistryEntry[]> {
    const characterIds = await this.loader.list();
    const entries: CharacterRegistryEntry[] = [];

    for (const id of characterIds) {
      const characterDir = join(this.charactersDir, id);
      try {
        const characterFile = await this.loader.load(id);
        entries.push({
          id,
          path: characterDir,
          manifest: characterFile.manifest,
          installed: true,
        });
      } catch {
        entries.push({
          id,
          path: characterDir,
          installed: true,
        });
      }
    }

    return entries;
  }

  async info(characterId: string): Promise<CharacterRegistryEntry> {
    const characterDir = join(this.charactersDir, characterId);
    const characterFile = await this.loader.load(characterId);

    return {
      id: characterId,
      path: characterDir,
      manifest: characterFile.manifest,
      installed: true,
    };
  }

  async validate(characterId: string): Promise<CharacterValidationResult> {
    return this.validator.validate(characterId);
  }

  async install(characterId: string, source: string): Promise<void> {
    const characterDir = join(this.charactersDir, characterId);
    await mkdir(characterDir, { recursive: true });

    // Copy files from source to characterDir
    // This is a simplified version - real implementation would use unzip
    const files = await readdir(source);
    for (const file of files) {
      const srcPath = join(source, file);
      const destPath = join(characterDir, file);
      const content = await readFile(srcPath);
      await writeFile(destPath, content);
    }
  }

  async uninstall(characterId: string): Promise<void> {
    const characterDir = join(this.charactersDir, characterId);
    await unlink(characterDir);
  }
}

async function readFile(path: string): Promise<Buffer> {
  const { readFile: readFileFn } = await import("node:fs/promises");
  return readFileFn(path);
}
