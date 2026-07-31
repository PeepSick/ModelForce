import { Command } from "commander";

export const modelsCommand = new Command("models")
  .description("Manage TTS models")
  .addCommand(
    new Command("list")
      .description("List installed models")
      .option("--provider <provider>", "Filter by provider")
      .action(async (options) => {
        console.log("Installed models:");
        console.log("  (no models installed)");
      })
  )
  .addCommand(
    new Command("install")
      .description("Install a model")
      .argument("<model-id>", "Model ID (e.g., piper/tr_TR_female-medium)")
      .action(async (modelId) => {
        console.log("Installing model: " + modelId);
      })
  )
  .addCommand(
    new Command("uninstall")
      .description("Uninstall a model")
      .argument("<model-id>", "Model ID")
      .action(async (modelId) => {
        console.log("Uninstalling model: " + modelId);
      })
  );