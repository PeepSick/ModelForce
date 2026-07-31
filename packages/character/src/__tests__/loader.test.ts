import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { CharacterLoader } from "../loader.js";

const testDir = join(import.meta.dirname, "__test-tmp__");

beforeAll(async () => {
  await mkdir(testDir, { recursive: true });
});

afterAll(async () => {
  await rm(testDir, { recursive: true, force: true });
});

describe("CharacterLoader", () => {
  it("should load a character from directory", async () => {
    const characterDir = join(testDir, "test-char");
    await mkdir(characterDir, { recursive: true });

    await writeFile(
      join(characterDir, "manifest.json"),
      JSON.stringify({
        id: "test-char",
        displayName: "Test Character",
        description: "A test character",
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

    const loader = new CharacterLoader(testDir);
    const character = await loader.load("test-char");

    expect(character.manifest.id).toBe("test-char");
    expect(character.persona).toBe("# Test Persona");
  });

  it("should list characters", async () => {
    const loader = new CharacterLoader(testDir);
    const characters = await loader.list();

    expect(characters).toContain("test-char");
  });

  it("should return empty list for non-existent directory", async () => {
    const loader = new CharacterLoader("/nonexistent/path");
    const characters = await loader.list();

    expect(characters).toEqual([]);
  });
});
