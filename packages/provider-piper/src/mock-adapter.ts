import {
  PiperBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";

export interface MockAdapterConfig {
  latencyMs?: number;
  sampleRate?: number;
  failSynthesize?: boolean;
  failHealth?: boolean;
  voices?: VoiceManifest[];
}

const DEFAULT_VOICES: VoiceManifest[] = [
  { id: "mock-voice-female", name: "Mock Female", language: "en-US", gender: "female", file: "mock-voice-female.onnx" },
  { id: "mock-voice-male", name: "Mock Male", language: "en-US", gender: "male", file: "mock-voice-male.onnx" },
];

function createWavHeader(dataLength: number, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

export class MockBackendAdapter implements PiperBackendAdapter {
  readonly id = "mock";
  readonly name = "Mock Backend";

  private config: MockAdapterConfig;
  private synthesizeCalls: SynthesizeRequest[] = [];

  constructor(config?: MockAdapterConfig) {
    this.config = {
      latencyMs: 10,
      sampleRate: 22050,
      failSynthesize: false,
      failHealth: false,
      voices: DEFAULT_VOICES,
      ...config,
    };
  }

  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    this.synthesizeCalls.push(request);

    if (this.config.failSynthesize) {
      throw new Error("Mock synthesis failure");
    }

    if (this.config.latencyMs && this.config.latencyMs > 0) {
      await new Promise((r) => setTimeout(r, this.config.latencyMs));
    }

    const sampleRate = this.config.sampleRate ?? 22050;
    const samplesPerMs = sampleRate / 1000;
    const durationMs = request.text.length * 50;
    const sampleCount = Math.floor(samplesPerMs * durationMs);

    const audioData = Buffer.alloc(sampleCount * 2);
    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleRate;
      const freq = request.voiceId?.includes("female") ? 440 : 220;
      const sample = Math.sin(2 * Math.PI * freq * t) * 0.3;
      const int16 = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
      audioData.writeInt16LE(int16, i * 2);
    }

    const header = createWavHeader(audioData.length, sampleRate, 1, 16);
    const audio = Buffer.concat([header, audioData]);

    return {
      audio,
      sampleRate,
      channels: 1,
    };
  }

  async health(): Promise<BackendHealth> {
    if (this.config.failHealth) {
      return { status: "unavailable", details: "Mock health failure" };
    }
    return { status: "healthy", details: "Mock backend operational" };
  }

  async isInstalled(): Promise<boolean> {
    return true;
  }

  async listVoices(): Promise<VoiceManifest[]> {
    return this.config.voices ?? DEFAULT_VOICES;
  }

  getSynthesizeCalls(): SynthesizeRequest[] {
    return [...this.synthesizeCalls];
  }

  reset(): void {
    this.synthesizeCalls = [];
  }
}
