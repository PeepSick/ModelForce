import { Command } from "commander";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { PiperProvider, PiperProcessAdapter, MockBackendAdapter } from "@modelforce/provider-piper";
import { loadConfig, getProviderConfig, isProviderInstalled, ProviderId } from "../config.js";
import type { TTSProvider } from "@modelforce/core";

export const quickCommand = new Command("quick")
  .description("Quick text-to-speech synthesis")
  .argument("<text>", "Text to synthesize")
  .option("-p, --provider <provider>", "Provider (piper, kokoro, xtts)")
  .option("-v, --voice <voice>", "Voice ID")
  .option("-o, --output <file>", "Output file (default: quick-output.wav)")
  .option("--mock", "Use mock adapter for testing")
  .action(async (text: string, options: { provider?: string; voice?: string; output?: string; mock?: boolean }) => {
    const cfg = await loadConfig();
    const providerId = (options.provider ?? cfg.activeProvider ?? "piper") as ProviderId;

    if (!(await isProviderInstalled(providerId)) && !options.mock) {
      console.error(chalk.red(`Provider "${providerId}" not installed. Run: modelforce pull ${providerId}`));
      process.exit(1);
    }

    const voice = options.voice ?? cfg.defaultVoice;
    if (!voice && !options.mock) {
      console.error(chalk.red(`No voice specified. Run: modelforce pull voice/${providerId}/<voice-id>`));
      process.exit(1);
    }

    let provider: TTSProvider;
    if (options.mock) {
      provider = new PiperProvider({ adapter: new MockBackendAdapter() });
    } else {
      const config = getProviderConfig(providerId);
      provider = new PiperProvider({ adapter: new PiperProcessAdapter(config) });
    }

    const output = options.output ?? "quick-output.wav";

    console.log(chalk.blue(`⚡ Quick synthesis: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`));

    const start = Date.now();
    const audio = await provider.synthesize(text, { voice: voice ?? undefined });
    const elapsed = Date.now() - start;

    await writeFile(output, audio);
    console.log(chalk.green(`✅ Done in ${elapsed}ms → ${output}`));
  });
