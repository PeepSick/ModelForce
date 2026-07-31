/**
 * Example 02: Voice Selection
 * 
 * List and use different voices.
 * 
 * Prerequisites:
 *   modelforce pull piper
 *   modelforce pull voice/piper/en_US-lessac-medium
 *   modelforce pull voice/piper/en_US-amy-medium
 * 
 * Run:
 *   npx tsx examples/02-voices/list-voices.ts
 */

import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";

const adapter = new PiperProcessAdapter({
  binPath: process.env.HOME + "/.modelforce/piper",
  voicesDir: process.env.HOME + "/.modelforce/voices/piper",
});

const provider = new PiperProvider({ adapter });

// List available voices
const voices = await provider.voices();

console.log("Available voices:");
for (const voice of voices) {
  console.log(`  ${voice.id} - ${voice.language}, ${voice.gender}`);
}

// Synthesize with different voice
if (voices.length > 0) {
  const audio = await provider.synthesize("This is a different voice.", {
    voice: voices[0].id,
  });
  console.log(`\nGenerated audio with ${voices[0].id}: ${audio.length} bytes`);
}
