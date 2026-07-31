import { Command } from "commander";

export const benchmarkCommand = new Command("benchmark")
  .description("Run benchmarks on installed providers")
  .argument("[provider]", "Specific provider to benchmark (optional)")
  .option("--iterations <number>", "Number of iterations", "10")
  .option("--text <text>", "Text to synthesize", "Merhaba, ben ModelForce Voice ekosistemi.")
  .action(async (provider, options) => {
    console.log("Running benchmark...");
    if (provider) {
      console.log("Provider: " + provider);
    } else {
      console.log("Provider: all installed");
    }
    console.log("Iterations: " + options.iterations);
    console.log("Text: " + options.text);
    console.log("\nBenchmark results will appear here.");
  });