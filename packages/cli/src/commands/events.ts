import { Command } from "commander";

export const eventsCommand = new Command("events")
  .description("View system events")
  .option("--last <number>", "Show last N events", "20")
  .option("--type <type>", "Filter by event type")
  .option("--stream", "Stream events in real-time")
  .action(async (options) => {
    if (options.stream) {
      console.log("Streaming events... (Ctrl+C to stop)");
    } else {
      console.log("Last " + options.last + " events:");
    }
    console.log("  (no events)");
  });