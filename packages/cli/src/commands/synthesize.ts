import { Command } from "commander";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { PiperProcessAdapter, PiperProvider, MockBackendAdapter } from "@modelforce/provider-piper";
import { KokoroProcessAdapter, KokoroProvider } from "@modelforce/provider-kokoro";
import { XttsProcessAdapter, XttsProvider } from "@modelforce/provider-xtts";
import { loadConfig, getProviderConfig, isProviderInstalled, ProviderId } from "../config.js";
import type { TTSProvider } from "@modelforce/core";

function createProvider(providerId: ProviderId, useMock: boolean = false): TTSProvider {
  const config = getProviderConfig(providerId);

  if (useMock) {
    return new PiperProvider({ adapter: new MockBackendAdapter() });
  }

  switch (providerId) {
    case "piper": {
      const adapter = new PiperProcessAdapter(config);
      return new PiperProvider({ adapter });
    }
    case "kokoro": {
      const adapter = new KokoroProcessAdapter(config);
      return new KokoroProvider({ adapter });
    }
    case "xtts": {
      const adapter = new XttsProcessAdapter(config);
      return new XttsProvider({ adapter });
    }
  }
}

export const synthesizeCommand = new Command("synthesize")
  .description("Synthesize text to speech")
  .argument("<text>", "Text to synthesize")
  .option("-p, --provider <provider>", "Provider (piper, kokoro, xtts)")
  .option("-o, --output <file>", "Output file (default: output.wav)")
  .option("-v, --voice <voice>", "Voice ID")
  .option("--list", "List available voices")
  .option("--mock", "Use mock adapter for testing")
  .action(async (text: string, options: { provider?: string; output?: string; voice?: string; list?: boolean; mock?: boolean }) => {
    const cfg = await loadConfig();
    const providerId = (options.provider ?? cfg.activeProvider ?? "piper") as ProviderId;

    if (options.list) {
      const provider = createProvider(providerId, options.mock);
      const voices = await provider.voices();
      console.log(`Available voices (${providerId}):`);
      for (const v of voices) {
        console.log(`  ${v.id} - ${v.language}, ${v.gender}`);
      }
      return;
    }

    if (!(await isProviderInstalled(providerId))) {
      console.error(chalk.red(`Provider "${providerId}" not installed. Run: modelforce pull ${providerId}`));
      process.exit(1);
    }

    const voice = options.voice ?? cfg.defaultVoice;
    if (!voice) {
      console.error(chalk.red(`No voice specified. Run: modelforce pull voice/${providerId}/<voice-id>`));
      process.exit(1);
    }

    const provider = createProvider(providerId, options.mock);
    const output = options.output ?? "output.wav";

    console.log(`Synthesizing: "${text}"`);
    console.log(`Provider: ${providerId}${options.mock ? " (mock)" : ""}`);
    console.log(`Voice: ${voice}`);
    console.log(`Output: ${output}`);

    const start = Date.now();
    const audio = await provider.synthesize(text, { voice });
    const elapsed = Date.now() - start;

    await writeFile(output, audio);
    console.log(`Done in ${elapsed}ms (${audio.length} bytes)`);
  });
