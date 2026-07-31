import { Command } from "commander";
import chalk from "chalk";
import { stat } from "fs/promises";
import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";
import { KokoroProcessAdapter, KokoroProvider } from "@modelforce/provider-kokoro";
import { XttsProcessAdapter, XttsProvider } from "@modelforce/provider-xtts";
import { loadConfig, getProviderConfig, isProviderInstalled, ProviderId } from "../config.js";
import type { TTSProvider } from "@modelforce/core";

interface BenchmarkResult {
  iteration: number;
  latencyMs: number;
  audioBytes: number;
  charsPerSecond: number;
  realtimeFactor: number;
  memoryUsedMB: number;
}

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function formatRtf(rtf: number): string {
  if (rtf < 1) return chalk.green(`${rtf.toFixed(2)}x`);
  if (rtf < 2) return chalk.yellow(`${rtf.toFixed(2)}x`);
  return chalk.red(`${rtf.toFixed(2)}x`);
}

function colorLatency(ms: number): string {
  if (ms < 200) return chalk.green(formatMs(ms));
  if (ms < 500) return chalk.yellow(formatMs(ms));
  return chalk.red(formatMs(ms));
}

function colorMemory(mb: number): string {
  if (mb < 100) return chalk.green(`${mb.toFixed(1)}MB`);
  if (mb < 500) return chalk.yellow(`${mb.toFixed(1)}MB`);
  return chalk.red(`${mb.toFixed(1)}MB`);
}

function createProvider(providerId: ProviderId): TTSProvider {
  const config = getProviderConfig(providerId);

  switch (providerId) {
    case "piper": {
      const adapter = new PiperProcessAdapter(config);
      return new PiperProvider({ adapter });
    }
    case "kokoro": {
      const adapter = new KokoroProcessAdapter(config);
      return new KokoroProvider({ adapter });
    }
    case "xtts": {
      const adapter = new XttsProcessAdapter(config);
      return new XttsProvider({ adapter });
    }
  }
}

async function getModelSize(providerId: ProviderId, voiceId: string): Promise<number> {
  const config = getProviderConfig(providerId);
  const filename = voiceId.split("/").pop() ?? voiceId;

  const extensions = [".onnx", ".onnx.json", ".bin", ".pth"];
  for (const ext of extensions) {
    try {
      const s = await stat(`${config.voicesDir}/${filename}${ext}`);
      return s.size;
    } catch {
      // continue
    }
  }

  return 0;
}

function getCpuUsage(): number {
  const usage = process.cpuUsage();
  return (usage.user + usage.system) / 1000; // Convert microseconds to milliseconds
}

export const benchmarkCommand = new Command("benchmark")
  .description("Benchmark TTS provider performance")
  .option("-p, --provider <provider>", "Provider (piper, kokoro, xtts)")
  .option("-v, --voice <voice>", "Voice ID")
  .option("-i, --iterations <n>", "Number of iterations", "10")
  .option("-t, --text <text>", "Custom text to synthesize")
  .option("--warmup", "Include warmup run")
  .option("--full", "Show detailed output")
  .action(async (options) => {
    const cfg = await loadConfig();
    const providerId: ProviderId = options.provider ?? cfg.activeProvider ?? "piper";

    if (!(await isProviderInstalled(providerId))) {
      console.error(chalk.red(`Provider "${providerId}" not installed. Run: modelforce pull ${providerId}`));
      process.exit(1);
    }

    const voice = options.voice ?? cfg.defaultVoice;
    if (!voice) {
      console.error(chalk.red(`No voice specified. Run: modelforce pull voice/${providerId}/<voice-id>`));
      process.exit(1);
    }

    const iterations = parseInt(options.iterations, 10);
    const testText = options.text ?? "The quick brown fox jumps over the lazy dog. This is a benchmark test of the text to speech system.";
    const showDetails = options.full || iterations <= 10;

    const provider = createProvider(providerId);

    console.log(chalk.bold.cyan(`\nBenchmark: ${providerId}\n`));
    console.log(`  Voice:      ${chalk.bold(voice)}`);
    console.log(`  Text:       ${chalk.dim(testText.substring(0, 50))}${testText.length > 50 ? "..." : ""}`);
    console.log(`  Chars:      ${testText.length}`);
    console.log(`  Iterations: ${iterations}`);
    console.log();

    // Warmup
    if (options.warmup) {
      process.stdout.write(chalk.dim("  Warmup... "));
      await provider.synthesize("warmup", { voice });
      console.log(chalk.green("done"));
      console.log();
    }

    // Reset CPU usage tracking
    process.cpuUsage();

    // Measure load time (first synthesis)
    const loadStart = Date.now();
    await provider.synthesize(testText, { voice });
    const loadTimeMs = Date.now() - loadStart;

    // Run benchmark
    const results: BenchmarkResult[] = [];
    const memorySnapshots: number[] = [];

    process.stdout.write(chalk.dim("  Running "));

    for (let i = 0; i < iterations; i++) {
      // Force GC if available
      if (global.gc) global.gc();

      const memBefore = process.memoryUsage().heapUsed;
      const start = Date.now();
      const audio = await provider.synthesize(testText, { voice });
      const latencyMs = Date.now() - start;
      const memAfter = process.memoryUsage().heapUsed;

      const audioDurationSec = audio.length / (22050 * 2);
      const charsPerSecond = testText.length / (latencyMs / 1000);
      const realtimeFactor = latencyMs / 1000 / audioDurationSec;
      const memoryUsedMB = Math.max(0, (memAfter - memBefore) / (1024 * 1024));

      memorySnapshots.push(memAfter / (1024 * 1024));

      results.push({
        iteration: i + 1,
        latencyMs,
        audioBytes: audio.length,
        charsPerSecond,
        realtimeFactor,
        memoryUsedMB,
      });

      process.stdout.write(".");
    }

    console.log(chalk.green(" done\n"));

    // Get CPU time
    const cpuTimeMs = getCpuUsage();

    // Get model size
    const modelSizeBytes = await getModelSize(providerId, voice);

    // Calculate stats
    const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
    const sizes = results.map((r) => r.audioBytes);
    const rtfValues = results.map((r) => r.realtimeFactor);

    const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    const totalCharsPerSec = results.reduce((sum, r) => sum + r.charsPerSecond, 0) / results.length;

    const coldStart = latencies[0];
    const warmStart = latencies.length > 1 ? latencies[1] : latencies[0];

    // Memory stats
    const memoryPeak = Math.max(...memorySnapshots);
    const memoryAvg = memorySnapshots.reduce((a, b) => a + b, 0) / memorySnapshots.length;

    console.log(chalk.bold("Latency\n"));
    console.log(`  P50          ${colorLatency(percentile(latencies, 50))}`);
    console.log(`  P95          ${colorLatency(percentile(latencies, 95))}`);
    console.log(`  P99          ${colorLatency(percentile(latencies, 99))}`);
    console.log(`  Min          ${colorLatency(latencies[0])}`);
    console.log(`  Max          ${colorLatency(latencies[latencies.length - 1])}`);
    console.log();

    console.log(chalk.bold("Performance\n"));
    console.log(`  Realtime     ${formatRtf(rtfValues.reduce((a, b) => a + b, 0) / rtfValues.length)}`);
    console.log(`  Throughput   ${chalk.bold(`${totalCharsPerSec.toFixed(1)} chars/s`)}`);
    console.log();

    console.log(chalk.bold("Output\n"));
    console.log(`  Avg Size     ${formatBytes(avgSize)}`);
    console.log(`  Sample Rate  ${chalk.dim("22050 Hz, 16-bit, mono")}`);
    console.log();

    console.log(chalk.bold("Resources\n"));
    console.log(`  Memory Peak  ${colorMemory(memoryPeak)}`);
    console.log(`  Memory Avg   ${colorMemory(memoryAvg)}`);
    console.log(`  CPU Time     ${chalk.cyan(formatMs(cpuTimeMs))}`);
    console.log(`  Model Size   ${chalk.cyan(formatBytes(modelSizeBytes))}`);
    console.log();

    console.log(chalk.bold("Startup\n"));
    console.log(`  Load Time    ${colorLatency(loadTimeMs)}`);
    console.log(`  Cold         ${colorLatency(coldStart)}`);
    console.log(`  Warm         ${colorLatency(warmStart)}`);
    console.log();

    // Raw data for comparison
    if (showDetails) {
      console.log(chalk.bold("Details\n"));
      console.log(chalk.dim("  Iter  Latency   Size     RTF    Chars/s  Mem"));
      console.log(chalk.dim("  ──────────────────────────────────────────────"));
      for (const r of results) {
        const lat = colorLatency(r.latencyMs);
        const sz = formatBytes(r.audioBytes).padStart(8);
        const rtf = formatRtf(r.realtimeFactor).padStart(6);
        const cps = r.charsPerSecond.toFixed(0).padStart(7);
        const mem = colorMemory(r.memoryUsedMB).padStart(10);
        console.log(`  ${String(r.iteration).padStart(4)}  ${lat.padEnd(10)} ${sz} ${rtf} ${cps} ${mem}`);
      }
      console.log();
    }
  });
