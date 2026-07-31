import { Plugin, PluginType, PluginHealth, PluginConfig } from "@modelforce/core";

export interface LoadedPlugin {
  plugin: Plugin;
  activated: boolean;
  loadedAt: Date;
}

export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();

  async load(pluginId: string): Promise<Plugin> {
    throw new Error("Not implemented");
  }

  async activate(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error("Plugin not loaded: " + pluginId);
    }

    await loaded.plugin.activate();
    loaded.activated = true;
  }

  async deactivate(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error("Plugin not loaded: " + pluginId);
    }

    await loaded.plugin.deactivate();
    loaded.activated = false;
  }

  async uninstall(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error("Plugin not loaded: " + pluginId);
    }

    await loaded.plugin.uninstall();
    this.plugins.delete(pluginId);
  }

  list(type?: PluginType): LoadedPlugin[] {
    const all = Array.from(this.plugins.values());
    if (type) {
      return all.filter((p) => p.plugin.type === type);
    }
    return all;
  }

  get(pluginId: string): LoadedPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  async health(pluginId: string): Promise<PluginHealth> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      return { status: "unavailable", details: "Plugin not loaded" };
    }

    return loaded.plugin.health();
  }
}