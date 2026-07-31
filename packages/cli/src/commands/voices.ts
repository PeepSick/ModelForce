import { Command } from "commander";
import { PiperProcessAdapter } from "@modelforce/provider-piper";
import { getVoicesDir, loadConfig } from "../config.js";

export const voicesCommand = new Command("voices")
  .description("List installed voices")
  .action(async () => {
    const config = await loadConfig();
    const adapter = new PiperProcessAdapter({
      binPath: "",
      voicesDir: getVoicesDir(),
    });

    const voices = await adapter.listVoices();

    if (voices.length === 0) {
      console.log("No voices installed.");
      console.log("Run: modelforce pull voice/piper/<voice-id>");
      return;
    }

    console.log("Installed voices:\n");
    for (const voice of voices) {
      const isDefault = config.defaultVoice === voice.id;
      const marker = isDefault ? " (default)" : "";
      console.log(`  ${voice.id}${marker}`);
      console.log(`    Language: ${voice.language}`);
      console.log(`    Gender: ${voice.gender}`);
      console.log();
    }
  });
