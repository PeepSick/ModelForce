import { Command } from "commander";

export const searchCommand = new Command("search")
  .description("Search for TTS providers, voices, characters")
  .argument("<type>", "Type to search: tts, voices, characters, models")
  .option("--registry <url>", "Registry URL")
  .action(async (type, _options) => {
    console.log("Searching for " + type + "...");
    console.log("Search results will appear here.");
  });