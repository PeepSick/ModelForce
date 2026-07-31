import { Command } from "commander";
import chalk from "chalk";
import { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { chmod, rm, readdir, mkdir } from "fs/promises";
import { copyFileSync } from "fs";
import {
  ensureDirs,
  getProviderConfig,
  loadConfig,
  saveConfig,
  ProviderId,
} from "../config.js";

const PIPER_RELEASES = "https://github.com/rhasspy/piper/releases/download";
const PIPER_VERSION = "2023.11.14-2";

const VOICE_URLS: Record<string, string> = {
  "piper/en_US-lessac-low": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/low/en_US-lessac-low.onnx",
  "piper/en_US-lessac-medium": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx",
  "piper/en_US-lessac-high": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/high/en_US-lessac-high.onnx",
  "piper/en_US-amy-medium": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/amy/medium/en_US-amy-medium.onnx",
  "piper/en_US-ryan-medium": "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/medium/en_US-ryan-medium.onnx",
  "piper/tr_TR-dfki-medium": "https://huggingface.co/rhasspy/piper-voices/resolve/main/tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx",

  "kokoro/kokoro-v1.0": "https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v1.0.onnx",
  "kokoro/af_heart": "https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/voices/af_heart.bin",
  "kokoro/en_sky": "https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/voices/en_sky.bin",

  "xtts/multilingual-v2": "https://huggingface.co/coqui/XTTS-v2/resolve/main/model.pth",
};

function voiceIdToFilename(voiceId: string): string {
  const parts = voiceId.split("/");
  return parts.length > 1 ? parts[1] : parts[0];
}

function voiceIdToProvider(voiceId: string): ProviderId {
  const parts = voiceId.split("/");
  return (parts[0] as ProviderId) ?? "piper";
}

function getPiperUrl(): string {
  const p = process.platform;
  const a = process.arch;
  let os: string;
  let arch: string;

  if (p === "win32") { os = "windows"; arch = a === "x64" ? "amd64" : "arm64"; }
  else if (p === "darwin") { os = "macos"; arch = a === "arm64" ? "aarch64" : "x86_64"; }
  else { os = "linux"; arch = a === "x64" ? "amd64" : "arm64"; }

  const ext = p === "win32" ? ".zip" : ".tar.gz";
  return `${PIPER_RELEASES}/${PIPER_VERSION}/piper_${os}_${arch}${ext}`;
}

async function download(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = res.body;
  if (!body) throw new Error("No response body");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await pipeline(Readable.fromWeb(body as unknown as ReadableStream), createWriteStream(dest));
}

export const pullCommand = new Command("pull")
  .description("Download providers, voices")
  .argument("<target>", "piper | kokoro | voice/<provider>/<voice-id>")
  .action(async (target: string) => {
    await ensureDirs();

    if (target === "piper") {
      await pullPiper();
    } else if (target === "kokoro") {
      await pullKokoro();
    } else if (target === "xtts") {
      await pullXtts();
    } else if (target.startsWith("voice/")) {
      const voiceId = target.slice(6);
      await pullVoice(voiceId);
    } else {
      console.error(chalk.red(`Unknown target: ${target}`));
      console.log("Usage:");
      console.log("  modelforce pull piper");
      console.log("  modelforce pull kokoro");
      console.log("  modelforce pull voice/piper/<voice-id>");
      console.log("  modelforce pull voice/kokoro/<voice-id>");
      process.exit(1);
    }
  });

async function pullPiper(): Promise<void> {
  const config = getProviderConfig("piper");

  console.log(chalk.bold("Downloading Piper binary..."));

  const url = getPiperUrl();
  console.log(`  URL: ${chalk.dim(url)}`);

  const tmpPath = config.binPath + ".tmp";
  const zipPath = config.binPath + ".zip";
  try {
    await download(url, tmpPath);
    
    // Rename .tmp to .zip for Windows extraction
    const { rename } = await import("node:fs/promises");
    await rename(tmpPath, zipPath);

    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const exec = promisify(execFile);

    if (process.platform === "win32") {
      // Windows: Extract from zip using PowerShell
      const extractDir = config.binPath + "_extracted";
      await mkdir(extractDir, { recursive: true });
      await exec("powershell", ["-Command", `Expand-Archive -Path "${zipPath}" -DestinationPath "${extractDir}" -Force`]);

      // Look for piper.exe in extracted directory and subdirectories
      const findPiperDir = async (dir: string): Promise<string | null> => {
        const files = await readdir(dir, { withFileTypes: true });
        for (const file of files) {
          if (file.name === "piper.exe") {
            return dir;
          }
          if (file.isDirectory()) {
            const found = await findPiperDir(`${dir}\\${file.name}`);
            if (found) return found;
          }
        }
        return null;
      };

      const piperDir = await findPiperDir(extractDir);
      if (piperDir) {
        // Copy all files recursively from piper directory to bin directory
        const copyDirRecursive = async (src: string, dest: string) => {
          const { mkdir: mkdirFn, readdir: readdirFn, copyFile } = await import("node:fs/promises");
          await mkdirFn(dest, { recursive: true });
          const entries = await readdirFn(src, { withFileTypes: true });
          for (const entry of entries) {
            const srcPath = `${src}\\${entry.name}`;
            const destPath = `${dest}\\${entry.name}`;
            if (entry.isDirectory()) {
              await copyDirRecursive(srcPath, destPath);
            } else {
              await copyFile(srcPath, destPath);
            }
          }
        };
        
        const binDir = config.binPath.replace(/piper\.exe$/, "");
        await copyDirRecursive(piperDir, binDir);
      }

      await rm(extractDir, { recursive: true, force: true });
    } else {
      // Unix: Extract from tar.gz
      await mkdir(config.voicesDir, { recursive: true });
      const extractDir = config.binPath + "_extracted";
      await exec("tar", ["xzf", zipPath, "-C", extractDir]);

      const files = await readdir(extractDir);
      const piperBin = files.find((f: string) => f.startsWith("piper"));
      if (piperBin) {
        copyFileSync(`${extractDir}/${piperBin}`, config.binPath);
        await chmod(config.binPath, 0o755);
      }

      await rm(extractDir, { recursive: true, force: true });
    }

    await rm(zipPath, { force: true });

    const cfg = await loadConfig();
    cfg.activeProvider = "piper";
    if (!cfg.installedProviders.includes("piper")) {
      cfg.installedProviders.push("piper");
    }
    await saveConfig(cfg);

    console.log(chalk.green("  Piper installed."));
  } catch (err) {
    await rm(tmpPath, { force: true }).catch(() => {});
    await rm(zipPath, { force: true }).catch(() => {});
    console.error(chalk.red(`  Failed: ${(err as Error).message}`));
    process.exit(1);
  }
}

async function pullKokoro(): Promise<void> {
  console.log(chalk.bold("Kokoro Setup"));
  console.log();
  console.log("  Kokoro requires Python and the kokoro-onnx package.");
  console.log();
  console.log("  Install:");
  console.log("    pip install kokoro-onnx");
  console.log();
  console.log("  Or use the HuggingFace model:");
  console.log("    huggingface-cli download hexgrad/Kokoro-82M");
  console.log();
  console.log("  Then run:");
  console.log("    modelforce pull voice/kokoro/kokoro-v1.0");
  console.log();

  const cfg = await loadConfig();
  if (!cfg.installedProviders.includes("kokoro")) {
    cfg.installedProviders.push("kokoro");
  }
  await saveConfig(cfg);
}

async function pullXtts(): Promise<void> {
  console.log(chalk.bold("XTTS Setup"));
  console.log();
  console.log("  XTTS requires Python and the TTS package.");
  console.log();
  console.log("  Install:");
  console.log("    pip install TTS");
  console.log();
  console.log("  Or run the XTTS server:");
  console.log("    tts-server --model_name tts_models/multilingual/multi-dataset/xtts_v2");
  console.log();
  console.log("  Then configure:");
  console.log("    modelforce config set providers.xtts.endpoint http://localhost:5002");
  console.log();

  const cfg = await loadConfig();
  if (!cfg.installedProviders.includes("xtts")) {
    cfg.installedProviders.push("xtts");
  }
  await saveConfig(cfg);
}

async function pullVoice(voiceId: string): Promise<void> {
  const url = VOICE_URLS[voiceId];
  if (!url) {
    console.error(chalk.red(`Unknown voice: ${voiceId}`));
    console.log();
    console.log("Available voices:");
    for (const id of Object.keys(VOICE_URLS)) {
      console.log(`  ${id}`);
    }
    process.exit(1);
  }

  const provider = voiceIdToProvider(voiceId);
  const config = getProviderConfig(provider);
  const filename = voiceIdToFilename(voiceId);

  await mkdir(config.voicesDir, { recursive: true });

  const ext = url.endsWith(".onnx") ? ".onnx" : url.endsWith(".bin") ? ".bin" : "";
  const modelPath = `${config.voicesDir}/${filename}${ext}`;

  console.log(chalk.bold(`Downloading voice: ${voiceId}`));
  console.log(`  URL: ${chalk.dim(url)}`);

  await download(url, modelPath);

  // Try to download config file
  const configUrl = url.replace(/\.onnx$/, ".onnx.json").replace(/\.bin$/, ".json");
  try {
    await download(configUrl, `${config.voicesDir}/${filename}.json`);
  } catch {
    // Config might not exist
  }

  const cfg = await loadConfig();
  if (!cfg.installedVoices.includes(voiceId)) {
    cfg.installedVoices.push(voiceId);
  }
  if (!cfg.defaultVoice) {
    cfg.defaultVoice = voiceId;
  }
  await saveConfig(cfg);

  console.log(chalk.green(`  Voice "${voiceId}" installed.`));
}
