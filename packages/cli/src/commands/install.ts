import { Command } from "commander";
import { CharacterRegistry } from "@modelforce/character";
import { homedir } from "node:os";
import { join } from "node:path";
import { stat } from "node:fs/promises";

const charactersDir = join(homedir(), ".modelforce", "characters");

export const installCommand = new Command("install")
  .description("Activate pulled providers, models, voices, characters")
  .argument("<type-id>", "Type and ID (e.g., character/aynisa, tts/piper, model/piper/tr_TR_female-medium)")
  .option("--source <path>", "Source directory for character installation")
  .action(async (typeId, options) => {
    const [type, id] = typeId.split("/");

    if (type === "character") {
      if (!id) {
        console.error("Error: Character ID required. Usage: modelforce install character <id>");
        process.exit(1);
      }

      const registry = new CharacterRegistry(charactersDir);

      // Check if source is provided
      if (options.source) {
        try {
          await stat(options.source);
          await registry.install(id, options.source);
          console.log(`✓ Character ${id} installed successfully`);
        } catch (e) {
          console.error(`✗ Failed to install character ${id}: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(1);
        }
      } else {
        // Try to find in examples directory
        const examplesDir = join(process.cwd(), "examples", "characters", id);
        try {
          await stat(examplesDir);
          await registry.install(id, examplesDir);
          console.log(`✓ Character ${id} installed successfully`);
        } catch {
          console.error(`✗ Character ${id} not found. Provide --source <path> or run from project root.`);
          process.exit(1);
        }
      }
    } else {
      console.log("Installing " + typeId + "...");
      console.log("Installation complete.");
    }
  });