import { Command } from "commander";

export const registryCommand = new Command("registry")
  .description("Manage registries")
  .addCommand(
    new Command("add")
      .description("Add a registry")
      .argument("<url>", "Registry URL")
      .option("--priority <number>", "Priority (lower = higher priority)", "10")
      .action(async (url, options) => {
        console.log("Adding registry: " + url + " (priority: " + options.priority + ")");
      })
  )
  .addCommand(
    new Command("list")
      .description("List configured registries")
      .action(async () => {
        console.log("Configured registries:");
        console.log("  (no registries configured)");
      })
  )
  .addCommand(
    new Command("remove")
      .description("Remove a registry")
      .argument("<url>", "Registry URL")
      .action(async (url) => {
        console.log("Removing registry: " + url);
      })
  )
  .addCommand(
    new Command("status")
      .description("Show registry connection status")
      .action(async () => {
        console.log("Registry status:");
        console.log("  (no registries configured)");
      })
  );