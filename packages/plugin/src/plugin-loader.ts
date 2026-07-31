import { Plugin, PluginType } from "@modelforce/core";

export class PluginLoader {
  private pluginPaths: Map<string, string> = new Map();

  register(pluginId: string, pluginPath: string): void {
    this.pluginPaths.set(pluginId, pluginPath);
  }

  async load(pluginId: string): Promise<Plugin> {
    const pluginPath = this.pluginPaths.get(pluginId);
    if (!pluginPath) {
      throw new Error("Plugin path not registered: " + pluginId);
    }

    throw new Error("Not implemented");
  }

  list(): Array<{ id: string; path: string }> {
    return Array.from(this.pluginPaths.entries()).map(([id, pluginPath]) => ({
      id,
      path: pluginPath,
    }));
  }
}