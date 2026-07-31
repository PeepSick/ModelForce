import { Command } from "commander";

export const voicesCommand = new Command("voices")
  .description("Manage voice registry")
  .addCommand(
    new Command("list")
      .description("List registered voices")
      .option("--json", "Output as JSON")
      .action(async (options) => {
        console.log("Registered voices:");
        console.log("  (no voices registered)");
      })
  )
  .addCommand(
    new Command("info")
      .description("Show voice details")
      .argument("<voice-id>", "Voice ID")
      .action(async (voiceId) => {
        console.log("Voice info: " + voiceId);
      })
  )
  .addCommand(
    new Command("add")
      .description("Register a voice pack")
      .argument("<pack-path>", "Path to voice pack directory")
      .action(async (packPath) => {
        console.log("Adding voice from: " + packPath);
      })
  )
  .addCommand(
    new Command("remove")
      .description("Unregister a voice")
      .argument("<voice-id>", "Voice ID")
      .action(async (voiceId) => {
        console.log("Removing voice: " + voiceId);
      })
  );