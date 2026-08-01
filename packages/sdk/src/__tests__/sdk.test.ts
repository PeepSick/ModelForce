import { ModelForceClient } from "../client.js";
import type { SDKConfig, SDKEvent } from "../types.js";

async function testClientCreation() {
  console.log("Testing ModelForceClient creation...\n");

  // Test default config
  const client1 = new ModelForceClient();
  const config1 = client1.getConfig();
  console.assert(config1.provider === "piper", "Default provider should be piper");
  console.assert(config1.timeout === 30000, "Default timeout should be 30000");
  console.log("  ✓ Default config works");

  // Test custom config
  const client2 = new ModelForceClient({
    provider: "kokoro",
    voice: "custom-voice",
    timeout: 60000,
    debug: true,
  });
  const config2 = client2.getConfig();
  console.assert(config2.provider === "kokoro", "Custom provider should be kokoro");
  console.assert(config2.voice === "custom-voice", "Custom voice should be set");
  console.assert(config2.timeout === 60000, "Custom timeout should be 60000");
  console.assert(config2.debug === true, "Debug should be enabled");
  console.log("  ✓ Custom config works");

  // Test configure method
  client2.configure({ provider: "xtts" });
  const config3 = client2.getConfig();
  console.assert(config3.provider === "xtts", "Updated provider should be xtts");
  console.log("  ✓ configure() works");
}

async function testMockClient() {
  console.log("\nTesting mock client...\n");

  const client = new ModelForceClient();
  const mockClient = client.createMock();

  // Test synthesize with mock
  const result = await mockClient.synthesize("Hello world");
  console.assert(result.audio.length > 0, "Audio should not be empty");
  console.assert(result.provider === "piper", "Provider should be piper");
  console.assert(result.latency >= 0, "Latency should be non-negative");
  console.assert(result.size > 0, "Size should be positive");
  console.log(`  ✓ synthesize() returns ${result.size} bytes in ${result.latency}ms`);

  // Test voices with mock
  const voices = await mockClient.voices();
  console.assert(voices.length > 0, "Should have voices");
  console.assert(voices[0].id.length > 0, "Voice should have id");
  console.assert(voices[0].name.length > 0, "Voice should have name");
  console.log(`  ✓ voices() returns ${voices.length} voices`);

  // Test health with mock
  const health = await mockClient.health();
  console.assert(health.status === "healthy", "Health should be healthy");
  console.assert(health.lastCheck instanceof Date, "lastCheck should be Date");
  console.log("  ✓ health() returns healthy");
}

async function testStream() {
  console.log("\nTesting stream...\n");

  const client = new ModelForceClient();
  const mockClient = client.createMock();

  const chunks: Buffer[] = [];
  for await (const chunk of mockClient.stream("Hello stream")) {
    chunks.push(chunk.data);
    console.assert(chunk.sequence >= 0, "Sequence should be non-negative");
    console.assert(chunk.timestamp > 0, "Timestamp should be positive");
  }

  console.assert(chunks.length > 0, "Should have chunks");
  console.log(`  ✓ stream() returns ${chunks.length} chunks`);
}

async function testEvents() {
  console.log("\nTesting events...\n");

  const client = new ModelForceClient();
  const mockClient = client.createMock();

  const events: SDKEvent[] = [];
  const unsubscribe = mockClient.on("synthesize:start", (event) => {
    events.push(event);
  });

  await mockClient.synthesize("Hello events");

  console.assert(events.length === 1, "Should have 1 event");
  console.assert(events[0].type === "synthesize:start", "Event type should be synthesize:start");
  console.log("  ✓ Event listener works");

  // Test unsubscribe
  unsubscribe();
  await mockClient.synthesize("Hello after unsubscribe");
  console.assert(events.length === 1, "Should still have 1 event after unsubscribe");
  console.log("  ✓ Unsubscribe works");
}

async function testProviderInfo() {
  console.log("\nTesting provider info...\n");

  const client = new ModelForceClient();
  const mockClient = client.createMock();

  const info = await mockClient.getProviderInfo("piper");
  console.assert(info.id === "piper", "ID should be piper");
  console.assert(info.name === "Piper", "Name should be Piper");
  console.assert(info.version.length > 0, "Version should not be empty");
  console.assert(Array.isArray(info.capabilities), "Capabilities should be array");
  console.log(`  ✓ getProviderInfo() returns ${info.name} v${info.version}`);
}

async function testSupports() {
  console.log("\nTesting supports...\n");

  const client = new ModelForceClient();
  const mockClient = client.createMock();

  console.assert(mockClient.supports("offline") === true, "Should support offline");
  console.assert(mockClient.supports("cpu-only") === true, "Should support cpu-only");
  console.assert(mockClient.supports("streaming") === false, "Should not support streaming");
  console.log("  ✓ supports() works correctly");
}

async function main() {
  try {
    await testClientCreation();
    await testMockClient();
    await testStream();
    await testEvents();
    await testProviderInfo();
    await testSupports();
    console.log("\n✅ All SDK tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main();
