import { TTSProvider } from "@modelforce/core";

export interface ComparisonResult {
  provider: string;
  voice: string;
  audioBytes: number;
  latencyMs: number;
  sampleRate: number;
  success: boolean;
  error?: string;
}

export interface ComparisonReport {
  text: string;
  results: ComparisonResult[];
  fastest: string | null;
  smallest: string | null;
}

export class ProviderComparer {
  private providers: TTSProvider[] = [];

  register(provider: TTSProvider): void {
    this.providers.push(provider);
  }

  unregister(providerId: string): void {
    this.providers = this.providers.filter((p) => p.id !== providerId);
  }

  async compare(
    text: string,
    voiceOverrides?: Record<string, string>
  ): Promise<ComparisonReport> {
    const results: ComparisonResult[] = [];

    for (const provider of this.providers) {
      const voice = voiceOverrides?.[provider.id];
      const options = voice ? { voice } : undefined;

      const start = Date.now();
      try {
        const audio = await provider.synthesize(text, options);
        results.push({
          provider: provider.id,
          voice: voice ?? "default",
          audioBytes: audio.length,
          latencyMs: Date.now() - start,
          sampleRate: 22050,
          success: true,
        });
      } catch (error) {
        results.push({
          provider: provider.id,
          voice: voice ?? "default",
          audioBytes: 0,
          latencyMs: Date.now() - start,
          sampleRate: 0,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    const successful = results.filter((r) => r.success);
    const fastest = successful.length > 0
      ? successful.reduce((a, b) => (a.latencyMs < b.latencyMs ? a : b)).provider
      : null;
    const smallest = successful.length > 0
      ? successful.reduce((a, b) => (a.audioBytes < b.audioBytes ? a : b)).provider
      : null;

    return {
      text,
      results,
      fastest,
      smallest,
    };
  }

  async compareMultiple(
    texts: string[],
    voiceOverrides?: Record<string, string>
  ): Promise<ComparisonReport[]> {
    const reports: ComparisonReport[] = [];
    for (const text of texts) {
      reports.push(await this.compare(text, voiceOverrides));
    }
    return reports;
  }
}

export function formatComparisonReport(report: ComparisonReport): string {
  const lines: string[] = [];

  lines.push(`Text: "${report.text.substring(0, 60)}${report.text.length > 60 ? "..." : ""}"`);
  lines.push("");

  for (const result of report.results) {
    const status = result.success ? "✓" : "✗";
    const latency = `${result.latencyMs}ms`;
    const size = result.audioBytes > 0 ? `${(result.audioBytes / 1024).toFixed(1)}KB` : "N/A";

    let line = `  ${status} ${result.provider.padEnd(12)} ${latency.padStart(8)} ${size.padStart(8)}`;
    if (result.error) {
      line += ` ${result.error}`;
    }
    if (report.fastest === result.provider) {
      line += " (fastest)";
    }
    if (report.smallest === result.provider) {
      line += " (smallest)";
    }
    lines.push(line);
  }

  return lines.join("\n");
}
