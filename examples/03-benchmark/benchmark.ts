/**
 * Example 03: Benchmark
 * 
 * Measure provider performance.
 * 
 * Prerequisites:
 *   modelforce pull piper
 *   modelforce pull voice/piper/en_US-lessac-medium
 * 
 * Run:
 *   npx tsx examples/03-benchmark/benchmark.ts
 */

import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";

const adapter = new PiperProcessAdapter({
  binPath: process.env.HOME + "/.modelforce/piper",
  voicesDir: process.env.HOME + "/.modelforce/voices/piper",
});

const provider = new PiperProvider({ adapter });

const text = "The quick brown fox jumps over the lazy dog.";
const iterations = 10;
const times: number[] = [];

console.log(`Benchmarking: "${text}"`);
console.log(`Iterations: ${iterations}\n`);

for (let i = 0; i < iterations; i++) {
  const start = Date.now();
  await provider.synthesize(text, { voice: "piper/en_US-lessac-medium" });
  const elapsed = Date.now() - start;
  times.push(elapsed);
  process.stdout.write(".");
}

console.log("\n");

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const min = Math.min(...times);
const max = Math.max(...times);

console.log(`Results:`);
console.log(`  Average: ${avg.toFixed(0)}ms`);
console.log(`  Min: ${min}ms`);
console.log(`  Max: ${max}ms`);
console.log(`  Throughput: ${(text.length / (avg / 1000)).toFixed(1)} chars/sec`);
