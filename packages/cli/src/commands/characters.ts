import { Command } from "commander";

export const charactersCommand = new Command("characters")
  .description("Manage character registry")
  .addCommand(
    new Command("list")
      .description("List registered characters")
      .option("--json", "Output as JSON")
      .action(async (options) => {
        console.log("Registered characters:");
        console.log("  (no characters registered)");
      })
  )
  .addCommand(
    new Command("info")
      .description("Show character details")
      .argument("<character-id>", "Character ID")
      .action(async (characterId) => {
        console.log("Character info: " + characterId);
      })
  )
  .addCommand(
    new Command("pull")
      .description("Download a character pack")
      .argument("<character-id>", "Character ID")
      .option("--registry <url>", "Registry URL")
      .action(async (characterId, options) => {
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