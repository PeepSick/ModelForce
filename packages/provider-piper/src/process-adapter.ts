import { spawn } from "child_process";
import { readFile, readdir, access, writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import {
  PiperBackendAdapter,
  SynthesizeRequest,
  SynthesizeResult,
  VoiceManifest,
  BackendHealth,
} from "./adapter.js";

export interface PiperProcessConfig {
  binPath: string;
  voicesDir: string;
  providerPrefix?: string;
}

export class PiperProcessAdapter implements PiperBackendAdapter {
  readonly id = "piper-process";
  readonly name = "Piper (Process)";

  private binPath: string;
  private voicesDir: string;
  private providerPrefix: string;

  constructor(config: PiperProcessConfig) {
    this.binPath = config.binPath;
    this.voicesDir = config.voicesDir;
    this.providerPrefix = config.providerPrefix ?? "piper";
  }

  private resolveFilename(voiceId: string): string {
    const parts = voiceId.split("/");
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private namespacedId(filename: string): string {
    return `${this.providerPrefix}/${filename}`;
  }

  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    const filename = this.resolveFilename(request.voiceId);
    const modelPath = join(this.voicesDir, filename + ".onnx");
    await access(modelPath);

    // Use temporary file for output (Windows doesn't support /dev/stdout)
    const tmpFile = join(tmpdir(), `piper-output-${Date.now()}.wav`);
    
    const args = [
      "--model", modelPath,
      "--output_file", tmpFile,
    ];

    if (request.speed) {
      args.push("--length-scale", String(1 / request.speed));
    }

    if (request.sampleRate) {
      args.push("--output-raw");
    }

    const proc = spawn(this.binPath, args, {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });

    const chunks: Buffer[] = [];

    proc.stdin.write(request.text);
    proc.stdin.end();

    return new Promise<SynthesizeResult>((resolve, reject) => {
      proc.stdout.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      proc.on("close", async (code: number | null) => {
        try {
          if (code === 0) {
            // Read from temporary file
            const audio = await readFile(tmpFile);
            await unlink(tmpFile).catch(() => {});
            
            resolve({
              audio,
              sampleRate: request.sampleRate ?? 22050,
              channels: 1,
            });
          } else {
            // Read error output
            const stderr = Buffer.concat(chunks).toString();
            reject(new Error(`Piper exited with code ${code}: ${stderr}`));
          }
        } catch (err) {
          reject(err);
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
        const configPath = join(this.voicesDir, rawId + ".onnx.json");

        try {
          const configData = await readFile(configPath, "utf-8");
          const config = JSON.parse(configData);

          voices.push({
            id: voiceId,
            name: config.speaker_id_map
              ? Object.keys(config.speaker_id_map)[0] ?? rawId
              : rawId,
            language: this.extractLanguage(rawId),
            gender: this.extractGender(rawId),
            file,
          });
        } catch {
          voices.push({
            id: voiceId,
            name: rawId,
            language: this.extractLanguage(rawId),
            gender: this.extractGender(rawId),
            file,
          });
        }
      }
    } catch {
      // voicesDir doesn't exist
    }

    return voices;
  }

  async install(voiceId: string, modelData: Buffer, configData?: Buffer): Promise<void> {
    await mkdir(this.voicesDir, { recursive: true });

    const filename = this.resolveFilename(voiceId);
    const modelPath = join(this.voicesDir, filename + ".onnx");
    await writeFile(modelPath, modelData);

    if (configData) {
      const configPath = join(this.voicesDir, filename + ".onnx.json");
      await writeFile(configPath, configData);
    }
  }

  private extractLanguage(rawId: string): string {
    const parts = rawId.split("-");
    if (parts.length >= 2) {
      return parts[0].replace(/_/g, "-");
    }
    return "en";
  }

  private extractGender(rawId: string): "female" | "male" | "neutral" {
    const lower = rawId.toLowerCase();
    if (lower.includes("female") || lower.includes("-f-")) return "female";
    if (lower.includes("male") || lower.includes("-m-")) return "male";
    return "neutral";
  }
}
