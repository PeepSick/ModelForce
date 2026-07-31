import { describe, it, expect } from "vitest";
import { CharacterManifestSchema } from "../manifest.js";

describe("CharacterManifest", () => {
  const validManifest = {
    id: "test-character",
    displayName: "Test Character",
    description: "A test character",
    language: "tr-TR",
    voice: "piper/tr_TR_female-medium",
    persona: {
      traits: ["arkadaşça"],
      tone: "sıcak",
      formality: "neutral",
      energy: "medium",
      systemPrompt: "Test system prompt",
    },
  };

  it("should validate a valid manifest", () => {
    const result = CharacterManifestSchema.parse(validManifest);
    expect(result.id).toBe("test-character");
    expect(result.displayName).toBe("Test Character");
  });

  it("should apply default values", () => {
    const result = CharacterManifestSchema.parse(validManifest);
    expect(result.version).toBe("0.1.0");
    expect(result.apiVersion).toBe("v1");
    expect(result.minRuntime).toBe("0.1.0");
    expect(result.skills).toEqual({ skills: [] });
    expect(result.tools).toEqual({ allow: [], deny: [] });
  });

  it("should reject invalid formality", () => {
    expect(() => {
      CharacterManifestSchema.parse({
        ...validManifest,
        persona: {
          ...validManifest.persona,
          formality: "invalid",
        },
      });
    }).toThrow();
  });

  it("should reject invalid energy", () => {
    expect(() => {
      CharacterManifestSchema.parse({
        ...validManifest,
        persona: {
          ...validManifest.persona,
          energy: "invalid",
        },
      });
    }).toThrow();
  });

  it("should accept optional fields", () => {
    const manifestWithOptionals = {
      ...validManifest,
      version: "1.0.0",
      author: "Test Author",
      avatar: {
        images: ["avatar.png"],
        expressions: ["happy"],
      },
      memory: {
        shortTermCapacity: 20,
        longTermEnabled: true,
        contextWindow: 8192,
        summaryStyle: "compact",
      },
    };

    const result = CharacterManifestSchema.parse(manifestWithOptionals);
    expect(result.version).toBe("1.0.0");
    expect(result.author).toBe("Test Author");
    expect(result.avatar?.images).toEqual(["avatar.png"]);
    expect(result.memory?.longTermEnabled).toBe(true);
  });
});
