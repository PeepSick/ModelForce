/**
 * Example 04: Provider Switch
 * 
 * Switch between providers with the same interface.
 * 
 * Prerequisites:
 *   modelforce pull piper
 *   modelforce pull voice/piper/en_US-lessac-medium
 * 
 * Run:
 *   npx tsx examples/04-provider-switch/switch.ts
 */

import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";
import type { TTSProvider } from "@modelforce/core";

// Create provider
function createProvider(name: string): TTSProvider {
  switch (name) {
    case "piper": {
      const adapter = new PiperProcessAdapter({
        binPath: process.env.HOME + "/.modelforce/piper",
        voicesDir: process.env.HOME + "/.modelforce/voices/piper",
      });
      return new PiperProvider({ adapter });
    }
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

// Same code, different provider
async function generateAudio(provider: TTSProvider, text: string): Promise<void> {
  const start = Date.now();
  const audio = await provider.synthesize(text, {
    voice: "piper/en_US-lessac-medium",
  });
  const elapsed = Date.now() - start;
  
  console.log(`[${provider.id}] ${audio.length} bytes in ${elapsed}ms`);
}

// Switch providers by changing one line
const providerName = "piper"; // Change this to switch providers
const provider = createProvider(providerName);

console.log(`Using provider: ${provider.id}`);
await generateAudio(provider, "Hello from ModelForce!");
