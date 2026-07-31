import type {
  TTSProvider,
  HealthStatus,
  VoiceInfo,
  RuntimePolicy,
  SynthesisRequest,
  SynthesisResult,
  StreamRequest,
  StreamChunk,
} from "@modelforce/core";
import { Router } from "./router.js";
import { HealthMonitor } from "./health.js";
import { FailoverManager } from "./failover.js";

export interface SpeechRuntimeConfig {
  policy: RuntimePolicy;
  providers: TTSProvider[];
}

export class SpeechRuntime {
  private router: Router;
  private healthMonitor: HealthMonitor;
  private failover: FailoverManager;
  private providers: Map<string, TTSProvider> = new Map();

  constructor(config: SpeechRuntimeConfig) {
    this.router = new Router(config.policy);
    this.healthMonitor = new HealthMonitor();
    this.failover = new FailoverManager();

    for (const provider of config.providers) {
      this.providers.set(provider.id, provider);
      this.router.registerProvider(provider);
    }
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const provider = this.router.selectProvider(request);
    if (!provider) {
      throw new Error("No available provider");
    }

    const startTime = Date.now();

    try {
      const audio = await provider.synthesize(request.text, {
        voice: request.voice,
      });

      return {
        id: request.id,
        audio,
        provider: provider.id,
        latency: Date.now() - startTime,
        timestamp: new Date(),
      };
    } catch (error) {
      const fallbackProvider = this.failover.getFallback(provider.id, this.providers);
      if (fallbackProvider) {
        const audio = await fallbackProvider.synthesize(request.text, {
          voice: request.voice,
        });

        return {
          id: request.id,
          audio,
          provider: fallbackProvider.id,
          latency: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      throw error;
    }
  }

  async *stream(request: StreamRequest): AsyncIterable<StreamChunk> {
    const provider = this.router.selectProvider(request);
    if (!provider) {
      throw new Error("No available provider");
    }

    try {
      yield* provider.stream(request.text, {
        voice: request.voice,
      });
    } catch (error) {
      const fallbackProvider = this.failover.getFallback(provider.id, this.providers);
      if (fallbackProvider) {
        yield* fallbackProvider.stream(request.text, {
          voice: request.voice,
        });
      } else {
        throw error;
      }
    }
  }

  async health(): Promise<Map<string, HealthStatus>> {
    const results = new Map<string, HealthStatus>();

    for (const [id, provider] of this.providers) {
      results.set(id, await provider.health());
    }

    return results;
  }

  async voices(): Promise<Map<string, VoiceInfo[]>> {
    const results = new Map<string, VoiceInfo[]>();

    for (const [id, provider] of this.providers) {
      results.set(id, await provider.voices());
    }

    return results;
  }
}