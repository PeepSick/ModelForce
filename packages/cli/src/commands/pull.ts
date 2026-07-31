import { Command } from "commander";

export const pullCommand = new Command("pull")
  .description("Download providers, models, voices, characters")
  .argument("<type-id>", "Type and ID (e.g., tts/piper, model/piper/tr_TR_female-medium)")
  .option("--registry <url>", "Registry URL")
  .option("--version <version>", "Specific version")
  .action(async (typeId, options) => {
    console.log("Pulling " + typeId + "...");
    console.log("Pull complete.");
  });