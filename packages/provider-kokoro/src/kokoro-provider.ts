import {
  TTSProvider,
  SynthesizeOptions,
  AudioChunk,
  HealthStatus,
  VoiceInfo,
  ProviderCapability,
} from "@modelforce/core";
import { KokoroBackendAdapter } from "./adapter.js";

export interface KokoroProviderConfig {
  adapter: KokoroBackendAdapter;
  defaultVoice?: string;
}

export class KokoroProvider implements TTSProvider {
  readonly id = "kokoro";
  readonly name = "Kokoro";
  readonly version = "1.0.0";

  private adapter: KokoroBackendAdapter;
  private defaultVoice: string;
  private voiceCache: VoiceInfo[] | null = null;

  constructor(config: KokoroProviderConfig) {
    this.adapter = config.adapter;
    this.defaultVoice = config.defaultVoice ?? "kokoro/en_default";
  }

  async synthesize(text: string, options?: SynthesizeOptions): Promise<Buffer> {
    const result = await this.adapter.synthesize({
      text,
      voiceId: options?.voice ?? this.defaultVoice,
      speed: options?.speed,
      sampleRate: options?.sampleRate,
    });

    return result.audio;
  }

  async *stream(text: string, options?: SynthesizeOptions): AsyncIterable<AudioChunk> {
    const audio = await this.synthesize(text, options);
    const chunkSize = 4096;
    let offset = 0;
    let sequence = 0;

    while (offset < audio.length) {
      const end = Math.min(offset + chunkSize, audio.length);
      const data = audio.subarray(offset, end);
      offset = end;

      yield {
        data,
        timestamp: Date.now(),
        sequence: sequence++,
        isLast: offset >= audio.length,
      };
    }
  }

  async health(): Promise<HealthStatus> {
    const backendHealth = await this.adapter.health();

    return {
      status: backendHealth.status === "healthy" ? "healthy" : "unavailable",
      latency: 0,
      lastCheck: new Date(),
      error: backendHealth.details,
    };
  }

  async voices(): Promise<VoiceInfo[]> {
    if (this.voiceCache) {
      return this.voiceCache;
    }

    const manifest = await this.adapter.listVoices();

    this.voiceCache = manifest.map((v) => ({
      id: v.id,
      name: v.name,
      language: v.language,
      gender: v.gender,
    }));

    return this.voiceCache;
  }

  supports(capability: ProviderCapability): boolean {
    const supported: ProviderCapability[] = [
      "offline",
      "cpu-only",
      "format-wav",
      "format-pcm",
    ];
    return supported.includes(capability);
  }

  getAdapter(): KokoroBackendAdapter {
    return this.adapter;
  }

  clearCache(): void {
    this.voiceCache = null;
  }
}
