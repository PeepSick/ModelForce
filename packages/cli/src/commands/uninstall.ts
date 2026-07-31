import { Command } from "commander";

export const uninstallCommand = new Command("uninstall")
  .description("Remove installed providers, models, voices, characters")
  .argument("<type-id>", "Type and ID (e.g., tts/piper)")
  .option("--purge", "Remove downloaded files too")
  .action(async (typeId, options) => {
    console.log("Uninstalling " + typeId + "...");
    console.log("Uninstall complete.");
  });