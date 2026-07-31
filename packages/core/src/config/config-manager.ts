import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import { RuntimeConfig, DEFAULT_RUNTIME_CONFIG } from "../types/runtime.js";

export interface RegistryConfig {
  url: string;
  auth?: string;
}

export interface ProvidersConfig {
  [key: string]: Record<string, unknown>;
}

export interface Config {
  registry: RegistryConfig[];
  providers: ProvidersConfig;
  runtime: RuntimeConfig;
}

export interface ConfigLoadOptions {
  configPath?: string;
  envPrefix?: string;
  cliOverrides?: Partial<Config>;
}

const DEFAULT_CONFIG: Config = {
  registry: [{ url: "https://registry.modelforce.ai" }],
  providers: {},
  runtime: DEFAULT_RUNTIME_CONFIG,
};

export class ConfigManager {
  private config: Config;
  private configPath?: string;

  constructor() {
    this.config = this.cloneConfig(DEFAULT_CONFIG);
  }

  async load(options?: ConfigLoadOptions): Promise<void> {
    const envPrefix = options?.envPrefix ?? "MODFORCE";

    // 1. Load global config (~/.modelforce/config.json)
    await this.loadFile(path.join(os.homedir(), ".modelforce", "config.json"));

    // 2. Load workspace config (.modelforce/config.json in ancestor directories)
    await this.loadWorkspaceConfig();

    // 3. Load project config (.modelforce/config.json in cwd)
    await this.loadFile(path.join(process.cwd(), ".modelforce", "config.json"));

    // 4. Load specified config path
    if (options?.configPath) {
      await this.loadFile(options.configPath);
    }

    // 5. Apply environment variable overrides
    this.applyEnvOverrides(envPrefix);

    // 6. Apply CLI overrides
    if (options?.cliOverrides) {
      this.merge(options.cliOverrides);
    }
  }

  get<K extends keyof Config>(key: K): Config[K] {
    return this.config[key];
  }

  set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
  }

  getAll(): Config {
    return this.cloneConfig(this.config);
  }

  private async loadFile(filePath: string): Promise<void> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(data) as Partial<Config>;
      this.merge(parsed);
      this.configPath = filePath;
    } catch {
      // File doesn't exist or is invalid - skip
    }
  }

  private async loadWorkspaceConfig(): Promise<void> {
    let currentDir = process.cwd();
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const configPath = path.join(currentDir, ".modelforce", "config.json");
      try {
        await fs.access(configPath);
        await this.loadFile(configPath);
        return;
      } catch {
        // No config in this directory, go up
      }
      currentDir = path.dirname(currentDir);
    }
  }

  private applyEnvOverrides(prefix: string): void {
    const registryUrl = process.env[`${prefix}_REGISTRY_URL`];
    if (registryUrl) {
      this.config.registry = [{ url: registryUrl }];
    }

    const maxConcurrent = process.env[`${prefix}_MAX_CONCURRENT`];
    if (maxConcurrent) {
      this.config.runtime.maxConcurrent = parseInt(maxConcurrent, 10);
    }

    const maxRetries = process.env[`${prefix}_MAX_RETRIES`];
    if (maxRetries) {
      this.config.runtime.maxRetries = parseInt(maxRetries, 10);
    }

    const timeout = process.env[`${prefix}_TIMEOUT`];
    if (timeout) {
      this.config.runtime.synthesisTimeout = parseInt(timeout, 10);
    }
  }

  private merge(partial: Partial<Config>): void {
    if (partial.registry) {
      this.config.registry = partial.registry;
    }
    if (partial.providers) {
      this.config.providers = {
        ...this.config.providers,
        ...partial.providers,
      };
    }
    if (partial.runtime) {
      this.config.runtime = {
        ...this.config.runtime,
        ...partial.runtime,
      };
    }
  }

  private cloneConfig(config: Config): Config {
    return {
      registry: [...config.registry],
      providers: { ...config.providers },
      runtime: { ...config.runtime },
    };
  }
}
