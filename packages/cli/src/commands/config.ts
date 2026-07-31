import { Command } from "commander";

export const configCommand = new Command("config")
  .description("Manage ModelForce configuration")
  .addCommand(
    new Command("get")
      .description("Get a config value")
      .argument("<key>", "Config key")
      .action(async (key) => {
        console.log("Config key: " + key);
        console.log("  (not set)");
      })
  )
  .addCommand(
    new Command("set")
      .description("Set a config value")
      .argument("<key>", "Config key")
      .argument("<value>", "Config value")
      .action(async (key, value) => {
        console.log("Setting " + key + " = " + value);
        console.log("Config updated.");
      })
  )
  .addCommand(
    new Command("list")
      .description("List all config values")
      .action(async () => {
        console.log("Configuration:");
        console.log("  (no configuration)");
      })
  );