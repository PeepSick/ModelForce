import * as fs from "fs/promises";
import * as path from "path";
import { ProviderMeta } from "@modelforce/core";
import { RegistryProvider } from "../registry-provider.js";

export interface DiscoverySource {
  type: "explicit" | "plugin" | "node_modules" | "registry" | "mirror" | "remote";
  priority: number;
}

export interface DiscoveryResult {
  provider: ProviderMeta;
  source: DiscoverySource;
  resolvedPath?: string;
}

export interface ProviderDiscoveryConfig {
  explicitPaths?: string[];
  pluginDirs?: string[];
  nodeModulesPaths?: string[];
  registries: RegistryProvider[];
}

const DEFAULT_DISCOVERY_ORDER: DiscoverySource["type"][] = [
  "explicit",
  "plugin",
  "node_modules",
  "registry",
  "mirror",
  "remote",
];

export class ProviderDiscovery {
  private config: ProviderDiscoveryConfig;
  private cache: Map<string, DiscoveryResult> = new Map();

  constructor(config: ProviderDiscoveryConfig) {
    this.config = config;
  }

  async discover(providerId: string, version?: string): Promise<DiscoveryResult | null> {
    const cacheKey = `${providerId}@${version ?? "latest"}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    for (const sourceType of DEFAULT_DISCOVERY_ORDER) {
      const result = await this.discoverFromSource(sourceType, providerId, version);
      if (result) {
        this.cache.set(cacheKey, result);
        return result;
      }
    }

    return null;
  }

  async discoverAll(): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];

    for (const sourceType of DEFAULT_DISCOVERY_ORDER) {
      const sourceResults = await this.discoverAllFromSource(sourceType);
      results.push(...sourceResults);
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async discoverFromSource(
    sourceType: DiscoverySource["type"],
    providerId: string,
    version?: string
  ): Promise<DiscoveryResult | null> {
    switch (sourceType) {
      case "explicit":
        return this.discoverExplicit(providerId, version);
      case "plugin":
        return this.discoverFromPlugins(providerId, version);
      case "node_modules":
        return this.discoverFromNodeModules(providerId, version);
      case "registry":
        return this.discoverFromRegistry(providerId, version);
      default:
        return null;
    }
  }

  private async discoverAllFromSource(sourceType: DiscoverySource["type"]): Promise<DiscoveryResult[]> {
    switch (sourceType) {
      case "registry":
        return this.discoverAllFromRegistry();
      default:
        return [];
    }
  }

  private async discoverExplicit(
    providerId: string,
    _version?: string
  ): Promise<DiscoveryResult | null> {
    const paths = this.config.explicitPaths ?? [];

    for (const basePath of paths) {
      const providerPath = path.join(basePath, providerId);
      const meta = await this.loadProviderMeta(providerPath);
      if (meta) {
        return {
          provider: meta,
          source: { type: "explicit", priority: 0 },
          resolvedPath: providerPath,
        };
      }
    }

    return null;
  }

  private async discoverFromPlugins(
    providerId: string,
    _version?: string
  ): Promise<DiscoveryResult | null> {
    const dirs = this.config.pluginDirs ?? [];

    for (const pluginDir of dirs) {
      const providerPath = path.join(pluginDir, providerId);
      const meta = await this.loadProviderMeta(providerPath);
      if (meta) {
        return {
          provider: meta,
          source: { type: "plugin", priority: 1 },
          resolvedPath: providerPath,
        };
      }
    }

    return null;
  }

  private async discoverFromNodeModules(
    providerId: string,
    _version?: string
  ): Promise<DiscoveryResult | null> {
    const paths = this.config.nodeModulesPaths ?? [path.join(process.cwd(), "node_modules")];

    for (const modulesPath of paths) {
      const packageName = `@modelforce/provider-${providerId}`;
      const providerPath = path.join(modulesPath, packageName);
      const meta = await this.loadProviderMeta(providerPath);
      if (meta) {
        return {
          provider: meta,
          source: { type: "node_modules", priority: 2 },
          resolvedPath: providerPath,
        };
      }
    }

    return null;
  }

  private async discoverFromRegistry(
    providerId: string,
    version?: string
  ): Promise<DiscoveryResult | null> {
    for (const registry of this.config.registries) {
      try {
        const meta = await registry.getProvider(providerId, version);
        return {
          provider: meta,
          source: { type: "registry", priority: 3 },
        };
      } catch {
        // Provider not found in this registry, try next
      }
    }

    return null;
  }

  private async discoverAllFromRegistry(): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];

    for (const registry of this.config.registries) {
      try {
        const providers = await registry.listProviders();
        for (const provider of providers) {
          results.push({
            provider,
            source: { type: "registry", priority: 3 },
          });
        }
      } catch {
        // Registry unavailable, skip
      }
    }

    return results;
  }

  private async loadProviderMeta(providerPath: string): Promise<ProviderMeta | null> {
    try {
      const manifestPath = path.join(providerPath, "manifest.json");
      const data = await fs.readFile(manifestPath, "utf-8");
      return JSON.parse(data) as ProviderMeta;
    } catch {
      return null;
    }
  }
}
