import { readdir, access } from "fs/promises";
import { join } from "path";
import {
  XttsBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";

export interface XttsHttpConfig {
  endpoint: string;
  apiKey?: string;
  voicesDir: string;
  providerPrefix?: string;
}

export class XttsHttpAdapter implements XttsBackendAdapter {
  readonly id = "xtts-http";
  readonly name = "XTTS (HTTP)";

  private endpoint: string;
  private apiKey?: string;
  private voicesDir: string;
  private providerPrefix: string;

  constructor(config: XttsHttpConfig) {
    this.endpoint = config.endpoint.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.voicesDir = config.voicesDir;
    this.providerPrefix = config.providerPrefix ?? "xtts";
  }

  private namespacedId(filename: string): string {
    return `${this.providerPrefix}/${filename}`;
  }

  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    // XTTS HTTP API (Coqui TTS Server)
    // POST /api/tts
    // Body: { text: "...", speaker_wav: "base64...", language: "en" }
    // Response: WAV audio
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const body = JSON.stringify({
      text: request.text,
      language: request.voiceId?.split("/")[0] ?? "en",
      speaker_wav: request.speakerWav?.toString("base64"),
    });

    const response = await fetch(`${this.endpoint}/api/tts`, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`XTTS HTTP error: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audio = Buffer.from(arrayBuffer);

    return {
      audio,
      sampleRate: request.sampleRate ?? 24000,
      channels: 1,
    };
  }

  async health(): Promise<BackendHealth> {
    try {
      const response = await fetch(`${this.endpoint}/health`);
      if (response.ok) {
        return { status: "healthy", details: "HTTP endpoint reachable" };
      }
      return { status: "degraded", details: `HTTP ${response.status}` };
    } catch {
      return { status: "unavailable", details: "HTTP endpoint unreachable" };
    }
  }

  async isInstalled(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listVoices(): Promise<VoiceManifest[]> {
    const voices: VoiceManifest[] = [];

    try {
      const files = await readdir(this.voicesDir);
      for (const file of files) {
        voices.push({
          id: this.namespacedId(file),
          name: file,
          language: "multilingual",
          gender: "neutral",
        });
      }
    } catch {
      // voicesDir doesn't exist
    }

    return voices;
  }
}

export interface XttsProcessConfig {
  binPath: string;
  voicesDir: string;
  providerPrefix?: string;
}

export class XttsProcessAdapter implements XttsBackendAdapter {
  readonly id = "xtts-process";
  readonly name = "XTTS (Process)";

  private binPath: string;
  private voicesDir: string;
  private providerPrefix: string;

  constructor(config: XttsProcessConfig) {
    this.binPath = config.binPath;
    this.voicesDir = config.voicesDir;
    this.providerPrefix = config.providerPrefix ?? "xtts";
  }

  private resolveFilename(voiceId: string): string {
    const parts = voiceId.split("/");
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private namespacedId(filename: string): string {
    return `${this.providerPrefix}/${filename}`;
  }

  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    // XTTS CLI (if available)
    // xtts --model model_dir --text "text" --output output.wav
    const { spawn } = await import("child_process");

    const filename = this.resolveFilename(request.voiceId);
    const modelPath = join(this.voicesDir, filename);
    await access(modelPath);

    const args = [
      "--model", modelPath,
      "--text", request.text,
      "--output", "/dev/stdout",
    ];

    const proc = spawn(this.binPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const chunks: Buffer[] = [];
    let stderr = "";

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    return new Promise<SynthesizeResult>((resolve, reject) => {
      proc.stdout.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      proc.on("close", (code: number | null) => {
        if (code === 0) {
          resolve({
            audio: Buffer.concat(chunks),
            sampleRate: request.sampleRate ?? 24000,
            channels: 1,
          });
        } else {
          reject(new Error(`XTTS exited with code ${code}: ${stderr}`));
        }
      });

      proc.on("error", reject);
    });
  }

  async health(): Promise<BackendHealth> {
    try {
      await access(this.binPath);
      return { status: "healthy", details: "Binary found" };
    } catch {
      return { status: "unavailable", details: "Binary not found" };
    }
  }

  async isInstalled(): Promise<boolean> {
    try {
      await access(this.binPath);
      return true;
    } catch {
      return false;
    }
  }

  async listVoices(): Promise<VoiceManifest[]> {
    const voices: VoiceManifest[] = [];

    try {
      const files = await readdir(this.voicesDir);
      for (const file of files) {
        voices.push({
          id: this.namespacedId(file),
          name: file,
          language: "multilingual",
          gender: "neutral",
        });
      }
    } catch {
      // voicesDir doesn't exist
    }

    return voices;
  }
}
