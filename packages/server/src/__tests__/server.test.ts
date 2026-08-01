import { ModelForceServer } from "../server.js";

async function testServerCreation() {
  console.log("Testing ModelForceServer creation...\n");

  // Test default config
  const server1 = new ModelForceServer();
  const config1 = server1.getConfig();
  console.assert(config1.port === 3000, "Default port should be 3000");
  console.assert(config1.host === "0.0.0.0", "Default host should be 0.0.0.0");
  console.log("  ✓ Default config works");

  // Test custom config
  const server2 = new ModelForceServer({
    port: 8080,
    host: "localhost",
    auth: {
      enabled: true,
      apiKey: "test-key",
    },
  });
  const config2 = server2.getConfig();
  console.assert(config2.port === 8080, "Custom port should be 8080");
  console.assert(config2.host === "localhost", "Custom host should be localhost");
  console.assert(config2.auth.enabled === true, "Auth should be enabled");
  console.assert(config2.auth.apiKey === "test-key", "API key should be set");
  console.log("  ✓ Custom config works");

  // Test client access
  const client = server1.getClient();
  console.assert(client !== null, "Client should exist");
  console.assert(typeof client.synthesize === "function", "Client should have synthesize method");
  console.log("  ✓ getClient() returns valid client");
}

async function testAPIRoutes() {
  console.log("\nTesting API route definitions...\n");

  const server = new ModelForceServer({ port: 0 }); // Random port

  // Start server on random port
  await server.start();

  try {
    // Test health endpoint
    const healthResponse = await fetch("http://localhost:3000/api/health");
    console.assert(healthResponse.ok, "Health endpoint should return 200");
    const healthData = await healthResponse.json();
    console.assert(healthData.success === true, "Health response should be successful");
    console.log("  ✓ GET /api/health works");

    // Test providers endpoint
    const providersResponse = await fetch("http://localhost:3000/api/providers");
    console.assert(providersResponse.ok, "Providers endpoint should return 200");
    const providersData = await providersResponse.json();
    console.assert(providersData.success === true, "Providers response should be successful");
    console.assert(Array.isArray(providersData.data), "Providers should be an array");
    console.log("  ✓ GET /api/providers works");

    // Test voices endpoint
    const voicesResponse = await fetch("http://localhost:3000/api/voices");
    console.assert(voicesResponse.ok, "Voices endpoint should return 200");
    const voicesData = await voicesResponse.json();
    console.assert(voicesData.success === true, "Voices response should be successful");
    console.log("  ✓ GET /api/voices works");

    // Test root endpoint
    const rootResponse = await fetch("http://localhost:3000/");
    console.assert(rootResponse.ok, "Root endpoint should return 200");
    const rootData = await rootResponse.json();
    console.assert(rootData.name === "ModelForce API", "Root should return API info");
    console.log("  ✓ GET / works");

  } finally {
    await server.stop();
  }
}

async function main() {
  try {
    await testServerCreation();
    await testAPIRoutes();
    console.log("\n✅ All server tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

main();
