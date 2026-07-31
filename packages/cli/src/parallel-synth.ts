import { TTSProvider, SynthesizeOptions } from "@modelforce/core";

export interface SynthesisJob {
  id: string;
  text: string;
  options?: SynthesizeOptions;
}

export interface SynthesisResult {
  id: string;
  audio: Buffer;
  latencyMs: number;
  provider: string;
  error?: string;
}

export interface ParallelSynthesisConfig {
  maxConcurrency: number;
  timeoutMs: number;
}

const DEFAULT_CONFIG: ParallelSynthesisConfig = {
  maxConcurrency: 4,
  timeoutMs: 30000,
};

export class ParallelSynthesizer {
  private provider: TTSProvider;
  private config: ParallelSynthesisConfig;

  constructor(provider: TTSProvider, config?: Partial<ParallelSynthesisConfig>) {
    this.provider = provider;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async synthesizeAll(jobs: SynthesisJob[]): Promise<SynthesisResult[]> {
    const results: SynthesisResult[] = [];
    const queue = [...jobs];
    const active: Promise<void>[] = [];

    const processJob = async (job: SynthesisJob): Promise<void> => {
      const start = Date.now();

      try {
        const audio = await Promise.race([
          this.provider.synthesize(job.text, job.options),
          this.timeoutPromise(job.id),
        ]);

        results.push({
          id: job.id,
          audio,
          latencyMs: Date.now() - start,
          provider: this.provider.id,
        });
      } catch (error) {
        results.push({
          id: job.id,
          audio: Buffer.alloc(0),
          latencyMs: Date.now() - start,
          provider: this.provider.id,
          error: (error as Error).message,
        });
      }
    };

    while (queue.length > 0 || active.length > 0) {
      while (active.length < this.config.maxConcurrency && queue.length > 0) {
        const job = queue.shift()!;
        const promise = processJob(job).then(() => {
          active.splice(active.indexOf(promise), 1);
        });
        active.push(promise);
      }

      if (active.length > 0) {
        await Promise.race(active);
      }
    }

    return results;
  }

  async synthesizeBatch(
    texts: string[],
    options?: SynthesizeOptions
  ): Promise<SynthesisResult[]> {
    const jobs = texts.map((text, i) => ({
      id: `batch-${i}`,
      text,
      options,
    }));

    return this.synthesizeAll(jobs);
  }

  private timeoutPromise(jobId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Job ${jobId} timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }
}

export function calculateStats(results: SynthesisResult[]): {
  totalJobs: number;
  successful: number;
  failed: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  totalAudioBytes: number;
} {
  const successful = results.filter((r) => !r.error);
  const failed = results.filter((r) => r.error);
  const latencies = successful.map((r) => r.latencyMs).sort((a, b) => a - b);

  const avgLatencyMs = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;

  const p95Idx = Math.ceil(0.95 * latencies.length) - 1;
  const p95LatencyMs = latencies[Math.max(0, p95Idx)] ?? 0;

  const totalAudioBytes = successful.reduce((sum, r) => sum + r.audio.length, 0);

  return {
    totalJobs: results.length,
    successful: successful.length,
    failed: failed.length,
    avgLatencyMs,
    p95LatencyMs,
    totalAudioBytes,
  };
}
