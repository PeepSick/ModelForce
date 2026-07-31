import { readdir, readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { CharacterManifestSchema, type CharacterFile } from "./manifest.js";

export class CharacterLoader {
  private readonly charactersDir: string;

  constructor(charactersDir: string) {
    this.charactersDir = charactersDir;
  }

  async load(characterId: string): Promise<CharacterFile> {
    const characterDir = join(this.charactersDir, characterId);

    const manifest = await this.loadManifest(characterDir);
    const persona = await this.loadPersona(characterDir);
    const avatar = await this.loadAvatar(characterDir);

    return { manifest, persona, avatar };
  }

  async list(): Promise<string[]> {
    try {
      const entries = await readdir(this.charactersDir);
      const characters: string[] = [];

      for (const entry of entries) {
        const entryPath = join(this.charactersDir, entry);
        const entryStat = await stat(entryPath);

        if (entryStat.isDirectory()) {
          const manifestPath = join(entryPath, "manifest.json");
          try {
            await stat(manifestPath);
            characters.push(entry);
          } catch {
            // Not a character directory (no manifest.json)
          }
        }
      }

      return characters;
    } catch {
      return [];
    }
  }

  private async loadManifest(characterDir: string): Promise<import("./manifest.js").CharacterManifest> {
    const manifestPath = join(characterDir, "manifest.json");
    const content = await readFile(manifestPath, "utf-8");
    const data = JSON.parse(content);
    return CharacterManifestSchema.parse(data);
  }

  private async loadPersona(characterDir: string): Promise<string> {
    const personaPath = join(characterDir, "persona.md");
    return readFile(personaPath, "utf-8");
  }

  private async loadAvatar(characterDir: string): Promise<Buffer | undefined> {
    const avatarPath = join(characterDir, "avatar.png");
    try {
      return await readFile(avatarPath);
    } catch {
      return undefined;
    }
  }
}
