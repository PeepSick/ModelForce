export interface SynthesizeRequest {
  text: string;
  voiceId: string;
  speed?: number;
  sampleRate?: number;
  speakerWav?: Buffer;
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
}

export interface BackendHealth {
  status: "healthy" | "degraded" | "unavailable";
  details?: string;
}

export interface XttsBackendAdapter {
  readonly id: string;
  readonly name: string;

  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>;
  health(): Promise<BackendHealth>;
  isInstalled(): Promise<boolean>;
  listVoices(): Promise<VoiceManifest[]>;
}
