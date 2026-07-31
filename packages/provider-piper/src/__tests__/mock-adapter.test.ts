import { MockBackendAdapter } from "../mock-adapter.js";
import { PiperProvider } from "../piper-provider.js";

async function testMockAdapter() {
  console.log("Testing MockBackendAdapter...\n");

  const adapter = new MockBackendAdapter();

  // Test health
  const health = await adapter.health();
  console.assert(health.status === "healthy", "Health should be healthy");
  console.log("  ✓ health() returns healthy");

  // Test isInstalled
  const installed = await adapter.isInstalled();
  console.assert(installed === true, "Should be installed");
  console.log("  ✓ isInstalled() returns true");

  // Test listVoices
  const voices = await adapter.listVoices();
  console.assert(voices.length === 2, "Should have 2 mock voices");
  console.assert(voices[0].id === "mock-voice-female", "First voice should be female");
  console.log("  ✓ listVoices() returns 2 voices");

  // Test synthesize
  const result = await adapter.synthesize({
    text: "Hello world",
    voiceId: "mock-voice-female",
  });
  console.assert(result.audio.length > 0, "Audio should not be empty");
  console.assert(result.sampleRate === 22050, "Sample rate should be 22050");
  console.assert(result.channels === 1, "Channels should be 1");
  console.log(`  ✓ synthesize() returns ${result.audio.length} bytes`);

  // Test synthesize failure
  const failAdapter = new MockBackendAdapter({ failSynthesize: true });
  try {
    await failAdapter.synthesize({ text: "test", voiceId: "mock" });
    console.assert(false, "Should have thrown");
  } catch (e) {
    console.log("  ✓ synthesize() throws on failure");
  }

  // Test synthesize calls tracking
  const trackAdapter = new MockBackendAdapter();
  await trackAdapter.synthesize({ text: "first", voiceId: "mock" });
  await trackAdapter.synthesize({ text: "second", voiceId: "mock" });
  const calls = trackAdapter.getSynthesizeCalls();
  console.assert(calls.length === 2, "Should track 2 calls");
  console.assert(calls[0].text === "first", "First call text should match");
  console.log("  ✓ getSynthesizeCalls() tracks calls");

  // Test reset
  trackAdapter.reset();
  const afterReset = trackAdapter.getSynthesizeCalls();
  console.assert(afterReset.length === 0, "Should be empty after reset");
  console.log("  ✓ reset() clears calls");

  console.log("\nAll MockBackendAdapter tests passed!");
}

async function testPiperProvider() {
  console.log("\nTesting PiperProvider with MockBackend...\n");

  const adapter = new MockBackendAdapter();
  const provider = new PiperProvider({ adapter, defaultVoice: "mock-voice-female" });

  // Test health
  const health = await provider.health();
  console.assert(health.status === "healthy", "Health should be healthy");
  console.log("  ✓ health() returns healthy");

  // Test voices
  const voices = await provider.voices();
  console.assert(voices.length === 2, "Should have 2 voices");
  console.assert(voices[0].id === "mock-voice-female", "First voice should be female");
  console.log("  ✓ voices() returns 2 voices");

  // Test supports
  console.assert(provider.supports("offline") === true, "Should support offline");
  console.assert(provider.supports("cpu-only") === true, "Should support cpu-only");
  console.assert(provider.supports("streaming") === false, "Should not support streaming");
  console.log("  ✓ supports() works correctly");

  // Test synthesize
  const audio = await provider.synthesize("Hello ModelForce");
  console.assert(audio.length > 0, "Audio should not be empty");
  console.log(`  ✓ synthesize() returns ${audio.length} bytes`);

  // Test stream
  const chunks: Buffer[] = [];
  for await (const chunk of provider.stream("Hello stream")) {
    chunks.push(chunk.data);
  }
  console.assert(chunks.length > 0, "Should have chunks");
  console.log(`  ✓ stream() returns ${chunks.length} chunks`);

  console.log("\nAll PiperProvider tests passed!");
}

async function main() {
  try {
    await testMockAdapter();
    await testPiperProvider();
    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main();
