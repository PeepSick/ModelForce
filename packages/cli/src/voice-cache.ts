import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

const CACHE_DIR = join(homedir(), ".modelforce", "cache");
const VOICE_CACHE_FILE = join(CACHE_DIR, "voices.json");

export interface CachedVoice {
  id: string;
  name: string;
  language: string;
  gender: string;
  provider: string;
  cachedAt: number;
}

export interface VoiceCache {
  voices: CachedVoice[];
  updatedAt: number;
}

export class VoiceCacheStore {
  private cachePath: string;
  private cache: VoiceCache | null = null;
  private ttlMs: number;

  constructor(ttlMs: number = 3600000) {
    this.cachePath = VOICE_CACHE_FILE;
    this.ttlMs = ttlMs;
  }

  async get(): Promise<VoiceCache | null> {
    if (this.cache && !this.isExpired(this.cache)) {
      return this.cache;
    }

    try {
      const data = await readFile(this.cachePath, "utf-8");
      this.cache = JSON.parse(data);
      return this.cache;
    } catch {
      return null;
    }
  }

  async set(voices: CachedVoice[]): Promise<void> {
    this.cache = {
      voices,
      updatedAt: Date.now(),
    };

    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(this.cachePath, JSON.stringify(this.cache, null, 2));
  }

  async add(voice: CachedVoice): Promise<void> {
    const cache = await this.get();
    const voices = cache?.voices ?? [];

    const existing = voices.findIndex((v) => v.id === voice.id);
    if (existing >= 0) {
      voices[existing] = voice;
    } else {
      voices.push(voice);
    }

    await this.set(voices);
  }

  async remove(voiceId: string): Promise<void> {
    const cache = await this.get();
    if (!cache) return;

    const voices = cache.voices.filter((v) => v.id !== voiceId);
    await this.set(voices);
  }

  async has(voiceId: string): Promise<boolean> {
    const cache = await this.get();
    return cache?.voices.some((v) => v.id === voiceId) ?? false;
  }

  async getAll(): Promise<CachedVoice[]> {
    const cache = await this.get();
    return cache?.voices ?? [];
  }

  async clear(): Promise<void> {
    this.cache = null;
    try {
      const { unlink } = await import("fs/promises");
      await unlink(this.cachePath);
    } catch {
      // File doesn't exist
    }
  }

  private isExpired(cache: VoiceCache): boolean {
    return Date.now() - cache.updatedAt > this.ttlMs;
  }
}
