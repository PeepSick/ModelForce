import { Command } from "commander";
import chalk from "chalk";
import * as readline from "readline";
import { PiperProvider, PiperProcessAdapter } from "@modelforce/provider-piper";
import { KokoroProvider, KokoroProcessAdapter } from "@modelforce/provider-kokoro";
import { XttsProvider, XttsProcessAdapter } from "@modelforce/provider-xtts";
import { loadConfig, saveConfig, getProviderConfig, isProviderInstalled, ProviderId } from "../config.js";
import type { TTSProvider } from "@modelforce/core";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function createProvider(providerId: ProviderId): TTSProvider {
  const config = getProviderConfig(providerId);

  switch (providerId) {
    case "piper":
      return new PiperProvider({ adapter: new PiperProcessAdapter(config) });
    case "kokoro":
      return new KokoroProvider({ adapter: new KokoroProcessAdapter(config) });
    case "xtts":
      return new XttsProvider({ adapter: new XttsProcessAdapter(config) });
  }
}

export const wizardCommand = new Command("wizard")
  .description("Interactive setup wizard")
  .action(async () => {
    console.log(chalk.blue.bold("\n🎤 ModelForce Setup Wizard\n"));

    const config = await loadConfig();

    // Step 1: Check installed providers
    console.log(chalk.yellow("Step 1: Checking installed providers...\n"));

    const providers: ProviderId[] = ["piper", "kokoro", "xtts"];
    const installedProviders: ProviderId[] = [];

    for (const id of providers) {
      const installed = await isProviderInstalled(id);
      if (installed) {
        console.log(chalk.green(`  ✅ ${id} - installed`));
        installedProviders.push(id);
      } else {
        console.log(chalk.red(`  ❌ ${id} - not installed`));
      }
    }

    if (installedProviders.length === 0) {
      console.log(chalk.yellow("\n⚠️  No providers installed. Run: modelforce pull piper"));
      rl.close();
      return;
    }

    // Step 2: Select active provider
    console.log(chalk.yellow("\nStep 2: Select active provider\n"));

    const providerAnswer = await ask(
      `Select provider [${installedProviders.join(", ")}] (default: ${config.activeProvider ?? "piper"}): `
    );

    const selectedProvider = (providerAnswer || config.activeProvider || "piper") as ProviderId;

    if (!installedProviders.includes(selectedProvider)) {
      console.log(chalk.red(`\n❌ Provider "${selectedProvider}" is not installed`));
      rl.close();
      return;
    }

    console.log(chalk.green(`  Selected: ${selectedProvider}`));

    // Step 3: Select default voice
    console.log(chalk.yellow("\nStep 3: Select default voice\n"));

    try {
      const provider = createProvider(selectedProvider);
      const voices = await provider.voices();

      if (voices.length === 0) {
        console.log(chalk.yellow("  No voices available for this provider"));
      } else {
        console.log("  Available voices:\n");
        voices.forEach((v, i) => {
          console.log(`    ${i + 1}. ${v.id} - ${v.language}, ${v.gender || "unknown"}`);
        });

        const voiceAnswer = await ask(
          `\nSelect voice number [1-${voices.length}] (default: ${config.defaultVoice ?? "1"}): `
        );

        const voiceIndex = parseInt(voiceAnswer || "1", 10) - 1;
        if (voiceIndex >= 0 && voiceIndex < voices.length) {
          config.defaultVoice = voices[voiceIndex].id;
          console.log(chalk.green(`  Selected: ${voices[voiceIndex].id}`));
        } else {
          console.log(chalk.yellow("  Using first voice"));
          config.defaultVoice = voices[0].id;
        }
      }
    } catch (error) {
      console.log(chalk.yellow("  Could not load voices (provider may not be fully installed)"));
    }

    // Step 4: Save configuration
    console.log(chalk.yellow("\nStep 4: Save configuration\n"));

    config.activeProvider = selectedProvider;

    const saveAnswer = await ask("Save configuration? [Y/n]: ");
    if (saveAnswer.toLowerCase() !== "n") {
      await saveConfig(config);
      console.log(chalk.green("  ✅ Configuration saved"));
    } else {
      console.log(chalk.yellow("  ⏭️  Configuration not saved"));
    }

    // Done
    console.log(chalk.blue.bold("\n🎉 Setup complete!\n"));
    console.log("  Try it out:\n");
    console.log(chalk.cyan(`    modelforce quick "Hello world" --mock`));
    console.log(chalk.cyan(`    modelforce synthesize "Hello world"`));
    console.log(chalk.cyan(`    modelforce play "Hello world" --mock`));
    console.log("");

    rl.close();
  });
