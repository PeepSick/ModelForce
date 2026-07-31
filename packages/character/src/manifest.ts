import { z } from "zod";

export const CharacterManifestSchema = z.object({
  id: z.string(),
  version: z.string().default("0.1.0"),
  apiVersion: z.string().default("v1"),
  minRuntime: z.string().default("0.1.0"),
  displayName: z.string(),
  description: z.string(),
  author: z.string().optional(),
  language: z.string(),
  voice: z.string(),
  voiceOverrides: z
    .object({
      speed: z.number().optional(),
      pitch: z.number().optional(),
      emotion: z.string().optional(),
    })
    .optional(),
  persona: z.object({
    traits: z.array(z.string()),
    tone: z.string(),
    formality: z.enum(["casual", "neutral", "formal"]),
    energy: z.enum(["low", "medium", "high"]),
    systemPrompt: z.string(),
    greeting: z.string().optional(),
    farewell: z.string().optional(),
    styleGuide: z.string().optional(),
  }),
  skills: z
    .object({
      skills: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          prompt: z.string(),
          requiredTools: z.array(z.string()).optional(),
        })
      ),
    })
    .default({ skills: [] }),
  tools: z
    .object({
      allow: z.array(z.string()).default([]),
      deny: z.array(z.string()).default([]),
    })
    .default({ allow: [], deny: [] }),
  avatar: z
    .object({
      model: z.string().optional(),
      images: z.array(z.string()).optional(),
      expressions: z.array(z.string()).optional(),
      animations: z.array(z.string()).optional(),
    })
    .optional(),
  memory: z
    .object({
      shortTermCapacity: z.number().default(10),
      longTermEnabled: z.boolean().default(false),
      contextWindow: z.number().default(4096),
      summaryStyle: z.enum(["detailed", "compact"]).default("detailed"),
    })
    .optional(),
});

export type CharacterManifest = z.infer<typeof CharacterManifestSchema>;

export interface CharacterFile {
  manifest: CharacterManifest;
  persona: string;
  avatar?: Buffer;
}

export interface CharacterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
