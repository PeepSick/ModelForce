import { writeFile } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type { TTSProvider, SynthesizeOptions as CoreSynthesizeOptions } from "@modelforce/core";
import { PiperProvider, PiperProcessAdapter, MockBackendAdapter } from "@modelforce/provider-piper";
import { KokoroProvider, KokoroProcessAdapter } from "@modelforce/provider-kokoro";
import { XttsProvider, XttsProcessAdapter } from "@modelforce/provider-xtts";
import type {
  ProviderId,
  SynthesizeOptions,
  SynthesizeResult,
  VoiceInfo,
  HealthStatus,
  StreamChunk,
  SDKConfig,
  SDKEvent,
} from "./types.js";

/**
 * ModelForce SDK Client
 *
 * Simple API for text-to-speech synthesis.
 *
 * @example
 * ```typescript
 * import { ModelForceClient } from "@modelforce/sdk";
 *
 * const client = new ModelForceClient({ provider: "piper" });
 *
 * // Simple synthesis
 * const result = await client.synthesize("Hello world");
 * await client.writeFile("output.wav", result.audio);
 *
 * // With options
 * const result = await client.synthesize("Merhaba dünya", {
 *   voice: "piper/tr_TR-dfki-medium",
 *   speed: 1.2,
 * });
 *
 * // List voices
 * const voices = await client.voices();
 *
 * // Health check
 * const health = await client.health();
 * ```
 */
export class ModelForceClient {
  private config: SDKConfig;
  private providers: Map<ProviderId, TTSProvider> = new Map();
  private eventListeners: Map<string, Array<(event: SDKEvent) => void>> = new Map();

  constructor(config: SDKConfig = {}) {
    this.config = {
      provider: "piper",
      timeout: 30000,
      debug: false,
      ...config,
    };
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(text: string, options?: SynthesizeOptions): Promise<SynthesizeResult> {
    const providerId = options?.provider ?? this.config.provider ?? "piper";
    const provider = await this.getProvider(providerId);

    this.emit({ type: "synthesize:start", text, provider: providerId });

    const startTime = Date.now();

    const coreOptions: CoreSynthesizeOptions = {
      voice: options?.voice ?? this.config.voice,
      format: options?.format,
      sampleRate: options?.sampleRate,
      speed: options?.speed,
      emotion: options?.emotion,
    };

    try {
      const audio = await provider.synthesize(text, coreOptions);
      const latency = Date.now() - startTime;

      this.emit({ type: "synthesize:complete", latency, size: audio.length });

      if (options?.outputPath) {
        await writeFile(options.outputPath, audio);
      }

      return {
        audio,
        provider: providerId,
        latency,
        size: audio.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.emit({ type: "synthesize:error", error: errorMessage });
      throw error;
    }
  }

  /**
   * Stream text to speech
   */
  async *stream(text: string, options?: SynthesizeOptions): AsyncIterable<StreamChunk> {
    const providerId = options?.provider ?? this.config.provider ?? "piper";
    const provider = await this.getProvider(providerId);

    const coreOptions: CoreSynthesizeOptions = {
      voice: options?.voice ?? this.config.voice,
      format: options?.format,
      sampleRate: options?.sampleRate,
      speed: options?.speed,
      emotion: options?.emotion,
    };

    for await (const chunk of provider.stream(text, coreOptions)) {
      yield {
        data: chunk.data,
        timestamp: chunk.timestamp,
        sequence: chunk.sequence,
        isLast: chunk.isLast,
      };
    }
  }

  /**
   * List available voices
   */
  async voices(providerId?: ProviderId): Promise<VoiceInfo[]> {
    const provider = await this.getProvider(providerId ?? this.config.provider ?? "piper");
    const voices = await provider.voices();

    this.emit({ type: "voice:list", count: voices.length });

    return voices.map((v) => ({
      id: v.id,
      name: v.name,
      language: v.language,
      gender: v.gender,
      preview: v.preview,
    }));
  }

  /**
   * Check provider health
   */
  async health(providerId?: ProviderId): Promise<HealthStatus> {
    const provider = await this.getProvider(providerId ?? this.config.provider ?? "piper");
    const status = await provider.health();

    this.emit({ type: "health:check", status });

    return {
      status: status.status,
      latency: status.latency,
      lastCheck: status.lastCheck,
      error: status.error,
    };
  }

  /**
   * Check if a provider is supported
   */
  supports(capability: string, providerId?: ProviderId): boolean {
    const provider = this.providers.get(providerId ?? this.config.provider ?? "piper");
    if (!provider) {
      return false;
    }
    return provider.supports(capability as never);
  }

  /**
   * List installed providers
   */
  async listProviders(): Promise<ProviderId[]> {
    const providers: ProviderId[] = [];
    const allProviders: ProviderId[] = ["piper", "kokoro", "xtts"];

    for (const id of allProviders) {
      try {
        await this.getProvider(id);
        providers.push(id);
      } catch {
        // Provider not available
      }
    }

    return providers;
  }

  /**
   * Create a mock provider for testing
   */
  createMock(): ModelForceClient {
    const mockClient = new ModelForceClient({
      ...this.config,
      provider: "piper",
    });

    const mockProvider = new PiperProvider({
      adapter: new MockBackendAdapter(),
    });

    mockClient.providers.set("piper", mockProvider);
    return mockClient;
  }

  /**
   * Get provider information
   */
  async getProviderInfo(providerId: ProviderId): Promise<{
    id: ProviderId;
    name: string;
    version: string;
    capabilities: string[];
  }> {
    const provider = await this.getProvider(providerId);
    const capabilities = [
      "streaming",
      "offline",
      "gpu",
      "cpu-only",
      "multi-speaker",
      "ssml",
      "emotion",
      "speed",
      "format-pcm",
      "format-mp3",
      "format-wav",
      "format-ogg",
    ].filter((cap) => provider.supports(cap as never));

    return {
      id: providerId,
      name: provider.name,
      version: provider.version,
      capabilities,
    };
  }

  /**
   * Subscribe to SDK events
   */
  on(event: SDKEvent["type"], listener: (event: SDKEvent) => void): () => void {
    const listeners = this.eventListeners.get(event) ?? [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);

    return () => {
      const current = this.eventListeners.get(event) ?? [];
      this.eventListeners.set(
        event,
        current.filter((l) => l !== listener)
      );
    };
  }

  /**
   * Update configuration
   */
  configure(config: Partial<SDKConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<SDKConfig> {
    return { ...this.config };
  }

  private async getProvider(providerId: ProviderId): Promise<TTSProvider> {
    if (this.providers.has(providerId)) {
      return this.providers.get(providerId)!;
    }

    const provider = await this.createProvider(providerId);
    this.providers.set(providerId, provider);
    return provider;
  }

  private async createProvider(providerId: ProviderId): Promise<TTSProvider> {
    const config = this.getProviderConfig(providerId);

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
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }

  private getProviderConfig(providerId: ProviderId): { binPath: string; voicesDir: string } {
    const MODFORCE_DIR = join(homedir(), ".modelforce");
    const BIN_DIR = join(MODFORCE_DIR, "bin");
    const VOICES_DIR = join(MODFORCE_DIR, "voices");
    const ext = process.platform === "win32" ? ".exe" : "";

    switch (providerId) {
      case "piper":
        return {
          binPath: join(BIN_DIR, "piper" + ext),
          voicesDir: join(VOICES_DIR, "piper"),
        };
      case "kokoro":
        return {
          binPath: join(BIN_DIR, "kokoro-onnx" + ext),
          voicesDir: join(VOICES_DIR, "kokoro"),
        };
      case "xtts":
        return {
          binPath: join(BIN_DIR, "xtts" + ext),
          voicesDir: join(VOICES_DIR, "xtts"),
        };
    }
  }

  private emit(event: SDKEvent): void {
    const listeners = this.eventListeners.get(event.type) ?? [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }
}
