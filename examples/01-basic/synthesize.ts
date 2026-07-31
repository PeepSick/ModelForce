/**
 * Example 01: Basic Synthesis
 * 
 * Generate your first audio file in 5 lines.
 * 
 * Prerequisites:
 *   modelforce pull piper
 *   modelforce pull voice/piper/en_US-lessac-medium
 * 
 * Run:
 *   npx tsx examples/01-basic/synthesize.ts
 */

import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";
import { writeFile } from "fs/promises";

const adapter = new PiperProcessAdapter({
  binPath: process.env.HOME + "/.modelforce/piper",
  voicesDir: process.env.HOME + "/.modelforce/voices/piper",
});

const provider = new PiperProvider({ adapter });

const audio = await provider.synthesize("Hello, world! This is ModelForce.", {
  voice: "piper/en_US-lessac-medium",
});

await writeFile("hello.wav", audio);
console.log("✓ Generated hello.wav");
