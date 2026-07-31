import { PiperProcessAdapter } from "../process-adapter.js";
import { PiperProvider } from "../piper-provider.js";
import { access } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

const MODFORCE_DIR = join(homedir(), ".modelforce");
const BIN_DIR = join(MODFORCE_DIR, "bin");
const VOICES_DIR = join(MODFORCE_DIR, "voices");

function getPiperBinPath(): string {
  const ext = process.platform === "win32" ? ".exe" : "";
  return join(BIN_DIR, "piper" + ext);
}

async function isPiperInstalled(): Promise<boolean> {
  try {
    await access(getPiperBinPath());
    return true;
  } catch {
    return false;
  }
}

async function getInstalledVoices(): Promise<string[]> {
  const { readdir } = await import("fs/promises");
  try {
    const files = await readdir(VOICES_DIR);
    return files.filter((f: string) => f.endsWith(".onnx")).map((f: string) => f.replace(".onnx", ""));
  } catch {
    return [];
  }
}

async function main() {
  console.log("Integration Test: Piper Provider\n");

  // Check if Piper is installed
  const piperInstalled = await isPiperInstalled();
  if (!piperInstalled) {
    console.log("⚠ Piper not installed. Skipping integration test.");
    console.log("  Run: modelforce pull piper");
    console.log("  Run: modelforce pull voice/piper/en_US-lessac-medium");
    process.exit(0);
  }

  console.log("✓ Piper binary found");

  // Check for voices
  const rawVoices = await getInstalledVoices();
  if (rawVoices.length === 0) {
    console.log("⚠ No voices installed. Skipping integration test.");
    console.log("  Run: modelforce pull voice/piper/en_US-lessac-medium");
    process.exit(0);
  }

  const testVoice = `piper/${rawVoices[0]}`;
  console.log(`✓ Using voice: ${testVoice}`);

  // Create adapter and provider
  const adapter = new PiperProcessAdapter({
    binPath: getPiperBinPath(),
    voicesDir: VOICES_DIR,
  });

  const provider = new PiperProvider({ adapter, defaultVoice: testVoice });

  // Test health
  console.log("\nTesting health...");
  const health = await provider.health();
  console.assert(health.status === "healthy", "Health should be healthy");
  console.log(`  ✓ Status: ${health.status}`);

  // Test voices
  console.log("\nTesting voices...");
  const voices = await provider.voices();
  console.assert(voices.length > 0, "Should have voices");
  console.log(`  ✓ Found ${voices.length} voices`);
  for (const v of voices.slice(0, 3)) {
    console.log(`    - ${v.id} (${v.language}, ${v.gender})`);
  }

  // Test synthesize
  console.log("\nTesting synthesize...");
  const start = Date.now();
  const audio = await provider.synthesize("Hello ModelForce. This is a test.", { voice: testVoice });
  const elapsed = Date.now() - start;

  console.assert(audio.length > 0, "Audio should not be empty");
  console.log(`  ✓ Generated ${audio.length} bytes in ${elapsed}ms`);
  console.log(`  ✓ Audio format: WAV header present: ${audio[0] === 0x52 && audio[1] === 0x49}`);

  console.log("\n✅ Integration test passed!");
}

main().catch((error) => {
  console.error("\n❌ Integration test failed:", error);
  process.exit(1);
});
