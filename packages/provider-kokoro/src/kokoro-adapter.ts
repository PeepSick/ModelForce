import { spawn } from "child_process";
import { readdir, access } from "fs/promises";
import { join } from "path";
import {
  KokoroBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";

export interface KokoroProcessConfig {
  binPath: string;
  voicesDir: string;
  providerPrefix?: string;
}

export class KokoroProcessAdapter implements KokoroBackendAdapter {
  readonly id = "kokoro-process";
  readonly name = "Kokoro (Process)";

  private binPath: string;
  private voicesDir: string;
  private providerPrefix: string;

  constructor(config: KokoroProcessConfig) {
    this.binPath = config.binPath;
    this.voicesDir = config.voicesDir;
    this.providerPrefix = config.providerPrefix ?? "kokoro";
  }

  private resolveFilename(voiceId: string): string {
    const parts = voiceId.split("/");
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private namespacedId(filename: string): string {
    return `${this.providerPrefix}/${filename}`;
  }

  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    // Kokoro ONNX real CLI:
    // kokoro-onnx --model model.onnx --output output.wav "text"
    //
    // Or via Python:
    // python -m kokoro_onnx --model model.onnx --output output.wav "text"
    //
    // Some versions use kokoro-cli:
    // kokoro --model model.onnx --output output.wav "text"
    const filename = this.resolveFilename(request.voiceId);
    const modelPath = join(this.voicesDir, filename + ".onnx");
    await access(modelPath);

    const args = [
      "--model", modelPath,
      "--output", "/dev/stdout",
      request.text,  // Positional argument - text goes last
    ];

    if (request.speed) {
      args.push("--speed", String(request.speed));
    }

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
          reject(new Error(`Kokoro exited with code ${code}: ${stderr}`));
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
      const onnxFiles = files.filter((f: string) => f.endsWith(".onnx"));

      for (const file of onnxFiles) {
        const rawId = file.replace(".onnx", "");
        const voiceId = this.namespacedId(rawId);

        voices.push({
          id: voiceId,
          name: rawId,
          language: this.extractLanguage(rawId),
          gender: this.extractGender(rawId),
          file,
        });
      }
    } catch {
      // voicesDir doesn't exist
    }

    return voices;
  }

  private extractLanguage(rawId: string): string {
    if (rawId.startsWith("af_")) return "af";
    if (rawId.startsWith("am_")) return "am";
    if (rawId.startsWith("de_")) return "de";
    if (rawId.startsWith("en_")) return "en";
    if (rawId.startsWith("es_")) return "es";
    if (rawId.startsWith("fr_")) return "fr";
    if (rawId.startsWith("ha_")) return "ha";
    if (rawId.startsWith("it_")) return "it";
    if (rawId.startsWith("ja_")) return "ja";
    if (rawId.startsWith("ko_")) return "ko";
    if (rawId.startsWith("pl_")) return "pl";
    if (rawId.startsWith("pt_")) return "pt";
    if (rawId.startsWith("ru_")) return "ru";
    if (rawId.startsWith("sv_")) return "sv";
    if (rawId.startsWith("tr_")) return "tr";
    if (rawId.startsWith("zh_")) return "zh";
    return "en";
  }

  private extractGender(rawId: string): "female" | "male" | "neutral" {
    const lower = rawId.toLowerCase();
    if (lower.includes("f_")) return "female";
    if (lower.includes("m_")) return "male";
    return "neutral";
  }
}
