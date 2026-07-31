import { Plugin } from "@modelforce/core";

export interface PluginLoaderConfig {
  searchPaths: string[];
}

export class PluginLoader {
  private pluginPaths: Map<string, string> = new Map();
  private searchPaths: string[];
  private loadedModules: Map<string, Plugin> = new Map();

  constructor(config?: PluginLoaderConfig) {
    this.searchPaths = config?.searchPaths ?? [];
  }

  register(pluginId: string, pluginPath: string): void {
    this.pluginPaths.set(pluginId, pluginPath);
  }

  unregister(pluginId: string): void {
    this.pluginPaths.delete(pluginId);
    this.loadedModules.delete(pluginId);
  }

  addSearchPath(searchPath: string): void {
    if (!this.searchPaths.includes(searchPath)) {
      this.searchPaths.push(searchPath);
    }
  }

  async load(pluginId: string): Promise<Plugin> {
    const cached = this.loadedModules.get(pluginId);
    if (cached) {
      return cached;
    }

    const registeredPath = this.pluginPaths.get(pluginId);
    if (registeredPath) {
      return this.loadFromPath(pluginId, registeredPath);
    }

    for (const searchPath of this.searchPaths) {
      try {
        const pluginPath = `${searchPath}/${pluginId}`;
        return await this.loadFromPath(pluginId, pluginPath);
      } catch {
        continue;
      }
    }

    try {
      const npmPath = `@modelforce/plugin-${pluginId}`;
      return await this.loadFromPath(pluginId, npmPath);
    } catch {
      // Fall through
    }

    throw new Error(`Plugin not found: ${pluginId}`);
  }

  async loadFromPath(pluginId: string, pluginPath: string): Promise<Plugin> {
    const cached = this.loadedModules.get(pluginId);
    if (cached) {
      return cached;
    }

    try {
      const module = await import(pluginPath);

      const PluginClass = module.default ?? module.Plugin ?? module[pluginId];

      if (!PluginClass) {
        throw new Error(`No plugin export found in ${pluginPath}`);
      }

      const plugin: Plugin = typeof PluginClass === "function"
        ? new PluginClass()
        : PluginClass;

      if (!this.isValidPlugin(plugin)) {
        throw new Error(`Invalid plugin interface from ${pluginPath}`);
      }

      this.loadedModules.set(pluginId, plugin);
      return plugin;
    } catch (error) {
      throw new Error(`Failed to load plugin ${pluginId} from ${pluginPath}: ${(error as Error).message}`);
    }
  }

  list(): Array<{ id: string; path: string }> {
    return Array.from(this.pluginPaths.entries()).map(([id, pluginPath]) => ({
      id,
      path: pluginPath,
    }));
  }

  isLoaded(pluginId: string): boolean {
    return this.loadedModules.has(pluginId);
  }

  getLoaded(pluginId: string): Plugin | undefined {
    return this.loadedModules.get(pluginId);
  }

  private isValidPlugin(obj: unknown): obj is Plugin {
    const plugin = obj as Plugin;
    return (
      typeof plugin === "object" &&
      plugin !== null &&
      typeof plugin.id === "string" &&
      typeof plugin.name === "string" &&
      typeof plugin.type === "string" &&
      typeof plugin.version === "string" &&
      typeof plugin.install === "function" &&
      typeof plugin.activate === "function" &&
      typeof plugin.deactivate === "function" &&
      typeof plugin.uninstall === "function" &&
      typeof plugin.health === "function" &&
      typeof plugin.capabilities === "function"
    );
  }
}
