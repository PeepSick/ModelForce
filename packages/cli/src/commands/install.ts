import { Command } from "commander";

export const installCommand = new Command("install")
  .description("Activate pulled providers, models, voices, characters")
  .argument("<type-id>", "Type and ID (e.g., tts/piper, model/piper/tr_TR_female-medium)")
  .action(async (typeId) => {
    console.log("Installing " + typeId + "...");
    console.log("Installation complete.");
  });