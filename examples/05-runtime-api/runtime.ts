/**
 * Example 05: Runtime API
 * 
 * Use the ExecutionEngine for retry logic and timeouts.
 * 
 * Prerequisites:
 *   modelforce pull piper
 *   modelforce pull voice/piper/en_US-lessac-medium
 * 
 * Run:
 *   npx tsx examples/05-runtime-api/runtime.ts
 */

import { ExecutionEngine } from "@modelforce/runtime";
import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";

const adapter = new PiperProcessAdapter({
  binPath: process.env.HOME + "/.modelforce/piper",
  voicesDir: process.env.HOME + "/.modelforce/voices/piper",
});

const provider = new PiperProvider({ adapter });

// Create execution engine with retry logic
const engine = new ExecutionEngine({
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: "exponential",
  timeoutMs: 10000,
});

// Runtime context
const ctx = {
  requestId: "req-001",
  text: "Hello from ExecutionEngine!",
  options: {},
  startTime: Date.now(),
  metrics: { tokensIn: 0, tokensOut: 0, durationMs: 0, model: "piper" },
  logger: {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: () => {},
  },
};

// Execute with retry logic
try {
  const audio = await engine.execute(ctx, "Hello from ExecutionEngine!", (text) =>
    provider.synthesize(text, { voice: "piper/en_US-lessac-medium" })
  );
  
  console.log(`✓ Generated ${audio.length} bytes`);
  console.log(`  Retries: ${ctx.metrics.durationMs > 0 ? "used" : "none"}`);
} catch (error) {
  console.error(`✗ Failed: ${(error as Error).message}`);
}
