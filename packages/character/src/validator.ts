import { stat } from "node:fs/promises";
import { join } from "node:path";
import { CharacterLoader } from "./loader.js";
import type { CharacterValidationResult } from "./manifest.js";

export class CharacterValidator {
  private readonly charactersDir: string;
  private readonly loader: CharacterLoader;

  constructor(charactersDir: string) {
    this.charactersDir = charactersDir;
    this.loader = new CharacterLoader(charactersDir);
  }

  async validate(characterId: string): Promise<CharacterValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const characterDir = join(this.charactersDir, characterId);
    const manifestPath = join(characterDir, "manifest.json");
    const personaPath = join(characterDir, "persona.md");
    const avatarPath = join(characterDir, "avatar.png");

    // Check manifest.json
    try {
      await stat(manifestPath);
    } catch {
      errors.push("manifest.json missing");
    }

    // Check persona.md
    try {
      await stat(personaPath);
    } catch {
      errors.push("persona.md missing");
    }

    // Check avatar.png
    try {
      await stat(avatarPath);
    } catch {
      warnings.push("avatar.png missing");
    }

    // Try to load and validate manifest
    if (errors.length === 0) {
      try {
        await this.loader.load(characterId);
      } catch (e) {
        errors.push(`Invalid manifest: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
