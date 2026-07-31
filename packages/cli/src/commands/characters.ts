import { Command } from "commander";
import { CharacterRegistry } from "@modelforce/character";
import { homedir } from "node:os";
import { join } from "node:path";

const charactersDir = join(homedir(), ".modelforce", "characters");

export const charactersCommand = new Command("characters")
  .description("Manage character registry")
  .addCommand(
    new Command("list")
      .description("List registered characters")
      .option("--json", "Output as JSON")
      .action(async (options) => {
        const registry = new CharacterRegistry(charactersDir);
        const characters = await registry.list();

        if (characters.length === 0) {
          console.log("No characters installed.");
          console.log("Install with: modelforce install character <path>");
          return;
        }

        if (options.json) {
          console.log(JSON.stringify(characters, null, 2));
        } else {
          console.log("Installed characters:");
          for (const char of characters) {
            console.log(`  ${char.id} - ${char.manifest?.displayName || "Unknown"}`);
          }
        }
      })
  )
  .addCommand(
    new Command("info")
      .description("Show character details")
      .argument("<character-id>", "Character ID")
      .action(async (characterId) => {
        const registry = new CharacterRegistry(charactersDir);
        try {
          const entry = await registry.info(characterId);
          console.log(`Character: ${entry.id}`);
          if (entry.manifest) {
            console.log(`  Display Name: ${entry.manifest.displayName}`);
            console.log(`  Description: ${entry.manifest.description}`);
            console.log(`  Voice: ${entry.manifest.voice}`);
            console.log(`  Language: ${entry.manifest.language}`);
            console.log(`  Author: ${entry.manifest.author || "Unknown"}`);
          }
        } catch (e) {
          console.error(`Character not found: ${characterId}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("validate")
      .description("Validate a character")
      .argument("<character-id>", "Character ID")
      .action(async (characterId) => {
        const registry = new CharacterRegistry(charactersDir);
        try {
          const result = await registry.validate(characterId);
          if (result.valid) {
            console.log(`✓ Character ${characterId} is valid`);
          } else {
            console.log(`✗ Character ${characterId} is invalid`);
            for (const error of result.errors) {
              console.log(`  ✗ ${error}`);
            }
            for (const warning of result.warnings) {
              console.log(`  ⚠ ${warning}`);
            }
            process.exit(1);
          }
        } catch (e) {
          console.error(`Character not found: ${characterId}`);
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command("pull")
      .description("Download a character pack")
      .argument("<character-id>", "Character ID")
      .option("--registry <url>", "Registry URL")
      .action(async (characterId, _options) => {
        console.log("Pulling character: " + characterId);
      })
  )
  .addCommand(
    new Command("activate")
      .description("Activate a character")
      .argument("<character-id>", "Character ID")
      .action(async (characterId) => {
        console.log("Activating character: " + characterId);
      })
  )
  .addCommand(
    new Command("deactivate")
      .description("Deactivate a character")
      .argument("<character-id>", "Character ID")
      .action(async (characterId) => {
        console.log("Deactivating character: " + characterId);
      })
  );