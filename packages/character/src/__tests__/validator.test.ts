import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { CharacterValidator } from "../validator.js";

const testDir = join(import.meta.dirname, "__test-validator-tmp__");

beforeAll(async () => {
  await mkdir(testDir, { recursive: true });
});

afterAll(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe("CharacterValidator", () => {
  it("should validate a complete character", async () => {
    const characterId = "complete-char";
    const characterDir = join(testDir, characterId);
    await mkdir(characterDir, { recursive: true });

    await writeFile(
      join(characterDir, "manifest.json"),
      JSON.stringify({
        id: characterId,
        displayName: "Complete Character",
        description: "A complete character",
        language: "tr-TR",
        voice: "piper/tr_TR_female-medium",
        persona: {
          traits: ["test"],
          tone: "neutral",
          formality: "neutral",
          energy: "medium",
          systemPrompt: "Test prompt",
        },
      })
    );

    await writeFile(join(characterDir, "persona.md"), "# Test Persona");
    await writeFile(join(characterDir, "avatar.png"), "fake-png-data");

    const validator = new CharacterValidator(testDir);
    const result = await validator.validate(characterId);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should detect missing manifest.json", async () => {
    const characterId = "no-manifest";
    const characterDir = join(testDir, characterId);
    await mkdir(characterDir, { recursive: true });

    await writeFile(join(characterDir, "persona.md"), "# Test Persona");

    const validator = new CharacterValidator(testDir);
    const result = await validator.validate(characterId);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("manifest.json missing");
  });

  it("should detect missing persona.md", async () => {
    const characterId = "no-persona";
    const characterDir = join(testDir, characterId);
    await mkdir(characterDir, { recursive: true });

    await writeFile(
      join(characterDir, "manifest.json"),
      JSON.stringify({
        id: characterId,
        displayName: "No Persona",
        description: "A character without persona",
        language: "tr-TR",
        voice: "piper/tr_TR_female-medium",
        persona: {
          traits: ["test"],
          tone: "neutral",
          formality: "neutral",
          energy: "medium",
          systemPrompt: "Test prompt",
        },
      })
    );

    const validator = new CharacterValidator(testDir);
    const result = await validator.validate(characterId);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("persona.md missing");
  });

  it("should warn about missing avatar.png", async () => {
    const characterId = "no-avatar";
    const characterDir = join(testDir, characterId);
    await mkdir(characterDir, { recursive: true });

    await writeFile(
      join(characterDir, "manifest.json"),
      JSON.stringify({
        id: characterId,
        displayName: "No Avatar",
        description: "A character without avatar",
        language: "tr-TR",
        voice: "piper/tr_TR_female-medium",
        persona: {
          traits: ["test"],
          tone: "neutral",
          formality: "neutral",
          energy: "medium",
          systemPrompt: "Test prompt",
        },
      })
    );

    await writeFile(join(characterDir, "persona.md"), "# Test Persona");

    const validator = new CharacterValidator(testDir);
    const result = await validator.validate(characterId);

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain("avatar.png missing");
  });
});
