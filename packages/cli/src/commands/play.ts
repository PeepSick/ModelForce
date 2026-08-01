import { Command } from "commander";
import chalk from "chalk";
import { writeFile, unlink } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { PiperProvider, PiperProcessAdapter, MockBackendAdapter } from "@modelforce/provider-piper";
import { loadConfig, getProviderConfig, isProviderInstalled, ProviderId } from "../config.js";
import type { TTSProvider } from "@modelforce/core";

const execAsync = promisify(exec);

export const playCommand = new Command("play")
  .description("Synthesize and play text-to-speech")
  .argument("<text>", "Text to speak")
  .option("-p, --provider <provider>", "Provider (piper, kokoro, xtts)")
  .option("-v, --voice <voice>", "Voice ID")
  .option("--mock", "Use mock adapter for testing")
  .action(async (text: string, options: { provider?: string; voice?: string; mock?: boolean }) => {
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

    console.log(chalk.blue(`🔊 Speaking: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`));

    const start = Date.now();
    const audio = await provider.synthesize(text, { voice: voice ?? undefined });
    const elapsed = Date.now() - start;

    console.log(chalk.gray(`  Synthesized in ${elapsed}ms`));

    // Save to temp file
    const tempFile = `temp-play-${Date.now()}.wav`;
    await writeFile(tempFile, audio);

    try {
      // Try to play audio using system command
      if (process.platform === "win32") {
        await execAsync(`powershell -c "(New-Object Media.SoundPlayer '${tempFile}').PlaySync()"`);
      } else if (process.platform === "darwin") {
        await execAsync(`afplay ${tempFile}`);
      } else {
        await execAsync(`aplay ${tempFile}`);
      }
      console.log(chalk.green("✅ Played successfully"));
    } catch (error) {
      console.log(chalk.yellow("⚠️  Could not play audio (no audio player found)"));
      console.log(chalk.gray(`  Audio saved to: ${tempFile}`));
      return;
    } finally {
      // Clean up temp file
      try {
        await unlink(tempFile);
      } catch {
        // Ignore cleanup errors
      }
    }
  });
