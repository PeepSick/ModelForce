export interface SynthesizeRequest {
  text: string;
  voiceId: string;
  speed?: number;
  sampleRate?: number;
}

export interface SynthesizeResult {
  audio: Buffer;
  sampleRate: number;
  channels: number;
}

export interface VoiceManifest {
  id: string;
  name: string;
  language: string;
  gender: "female" | "male" | "neutral";
  file: string;
}

export interface BackendHealth {
  status: "healthy" | "degraded" | "unavailable";
  details?: string;
}

export interface PiperBackendAdapter {
  readonly id: string;
  readonly name: string;

  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>;
  health(): Promise<BackendHealth>;
  isInstalled(): Promise<boolean>;
  listVoices(): Promise<VoiceManifest[]>;
  install?(voiceId: string, modelData: Buffer, configData?: Buffer): Promise<void>;
}
