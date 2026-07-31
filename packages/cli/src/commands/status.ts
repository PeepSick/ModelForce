import { Command } from "commander";

export const statusCommand = new Command("status")
  .description("Show status of providers, models, voices, characters")
  .option("--json", "Output as JSON")
  .action(async (_options) => {
    console.log("ModelForce Status");
    console.log("=================");
    console.log("Providers: (none installed)");
    console.log("Models: (none installed)");
    console.log("Voices: (none installed)");
    console.log("Characters: (none installed)");
  });