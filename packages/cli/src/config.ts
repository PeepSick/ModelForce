import { join } from "path";
import { homedir } from "os";
import { mkdir, readFile, writeFile, readdir, access } from "fs/promises";

const MODFORCE_DIR = join(homedir(), ".modelforce");
const BIN_DIR = join(MODFORCE_DIR, "bin");
const VOICES_DIR = join(MODFORCE_DIR, "voices");
const CONFIG_FILE = join(MODFORCE_DIR, "config.json");

export type ProviderId = "piper" | "kokoro" | "xtts";

export interface ProviderConfig {
  binPath: string;
  voicesDir: string;
}

export interface ModForceConfig {
  activeProvider: ProviderId | null;
  installedProviders: ProviderId[];
  installedVoices: string[];
  defaultVoice: string | null;
}

const DEFAULT_CONFIG: ModForceConfig = {
  activeProvider: null,
  installedProviders: [],
  installedVoices: [],
  defaultVoice: null,
};

export async function ensureDirs(): Promise<void> {
  await mkdir(MODFORCE_DIR, { recursive: true });
  await mkdir(BIN_DIR, { recursive: true });
  await mkdir(VOICES_DIR, { recursive: true });
}

export async function loadConfig(): Promise<ModForceConfig> {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: ModForceConfig): Promise<void> {
  await ensureDirs();
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getProviderConfig(providerId: ProviderId): ProviderConfig {
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

export function getPiperBinPath(): string {
  return getProviderConfig("piper").binPath;
}

export function getVoicesDir(): string {
  return VOICES_DIR;
}

export async function isProviderInstalled(providerId: ProviderId): Promise<boolean> {
  const config = getProviderConfig(providerId);
  try {
    await access(config.binPath);
    return true;
  } catch {
    return false;
  }
}

export async function isPiperInstalled(): Promise<boolean> {
  return isProviderInstalled("piper");
}

export async function getInstalledVoices(providerId?: ProviderId): Promise<string[]> {
  try {
    const dir = providerId ? join(VOICES_DIR, providerId) : VOICES_DIR;
    const files = await readdir(dir);
    return files
      .filter((f) => f.endsWith(".onnx"))
      .map((f) => f.replace(".onnx", ""));
  } catch {
    return [];
  }
}

export async function isVoiceInstalled(voiceId: string): Promise<boolean> {
  const parts = voiceId.split("/");
  const provider = parts.length > 1 ? parts[0] : null;
  const filename = parts.length > 1 ? parts[1] : parts[0];

  const dir = provider ? join(VOICES_DIR, provider) : VOICES_DIR;
  try {
    await access(join(dir, filename + ".onnx"));
    return true;
  } catch {
    return false;
  }
}
