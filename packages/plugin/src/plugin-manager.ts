import type { Plugin, PluginType, PluginHealth } from "@modelforce/core";
import { PluginLoader } from "./plugin-loader.js";

export type PluginLifecycleState =
  | "registered"
  | "loading"
  | "loaded"
  | "activating"
  | "active"
  | "deactivating"
  | "error"
  | "uninstalled";

export interface LoadedPlugin {
  plugin: Plugin;
  state: PluginLifecycleState;
  loadedAt: Date;
  activatedAt?: Date;
  error?: Error;
}

export type PluginStateChangeCallback = (
  pluginId: string,
  previous: PluginLifecycleState,
  current: PluginLifecycleState
) => void;

export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private loader: PluginLoader;
  private stateListeners: Set<PluginStateChangeCallback> = new Set();

  constructor(loader?: PluginLoader) {
    this.loader = loader ?? new PluginLoader();
  }

  async load(pluginId: string): Promise<Plugin> {
    const existing = this.plugins.get(pluginId);
    if (existing) {
      if (existing.state === "error") {
        throw new Error(`Plugin in error state: ${pluginId}`);
      }
      return existing.plugin;
    }

    this.transitionState(pluginId, "loading");

    try {
      const plugin = await this.loader.load(pluginId);

      const loaded: LoadedPlugin = {
        plugin,
        state: "loaded",
        loadedAt: new Date(),
      };

      this.plugins.set(pluginId, loaded);
      this.transitionState(pluginId, "loaded");

      return plugin;
    } catch (error) {
      const loaded: LoadedPlugin = {
        plugin: null as unknown as Plugin,
        state: "error",
        loadedAt: new Date(),
        error: error as Error,
      };

      this.plugins.set(pluginId, loaded);
      this.transitionState(pluginId, "error");

      throw error;
    }
  }

  async activate(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    if (loaded.state === "active") {
      return;
    }

    if (loaded.state !== "loaded") {
      throw new Error(`Plugin cannot be activated from state: ${loaded.state}`);
    }

    this.transitionState(pluginId, "activating");

    try {
      await loaded.plugin.activate();
      loaded.state = "active";
      loaded.activatedAt = new Date();
      this.transitionState(pluginId, "active");
    } catch (error) {
      loaded.error = error as Error;
      this.transitionState(pluginId, "error");
      throw error;
    }
  }

  async deactivate(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    if (loaded.state !== "active") {
      return;
    }

    this.transitionState(pluginId, "deactivating");

    try {
      await loaded.plugin.deactivate();
      loaded.state = "loaded";
      loaded.activatedAt = undefined;
      this.transitionState(pluginId, "loaded");
    } catch (error) {
      loaded.error = error as Error;
      this.transitionState(pluginId, "error");
      throw error;
    }
  }

  async uninstall(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    if (loaded.state === "active") {
      await this.deactivate(pluginId);
    }

    try {
      await loaded.plugin.uninstall();
    } catch {
      // Ignore errors during uninstall
    }

    this.transitionState(pluginId, "uninstalled");
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

  getState(pluginId: string): PluginLifecycleState | undefined {
    return this.plugins.get(pluginId)?.state;
  }

  async health(pluginId: string): Promise<PluginHealth> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded || loaded.state !== "active") {
      return { status: "unavailable", details: "Plugin not active" };
    }

    try {
      return await loaded.plugin.health();
    } catch (error) {
      return {
        status: "unavailable",
        details: (error as Error).message,
      };
    }
  }

  async healthAll(): Promise<Map<string, PluginHealth>> {
    const results = new Map<string, PluginHealth>();

    for (const [id, loaded] of this.plugins) {
      if (loaded.state === "active") {
        try {
          results.set(id, await loaded.plugin.health());
        } catch (error) {
          results.set(id, {
            status: "unavailable",
            details: (error as Error).message,
          });
        }
      } else {
        results.set(id, { status: "unavailable", details: `State: ${loaded.state}` });
      }
    }

    return results;
  }

  onStateChange(callback: PluginStateChangeCallback): void {
    this.stateListeners.add(callback);
  }

  private transitionState(pluginId: string, newState: PluginLifecycleState): void {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) return;

    const previous = loaded.state;
    loaded.state = newState;

    for (const listener of this.stateListeners) {
      try {
        listener(pluginId, previous, newState);
      } catch (error) {
        console.error(`PluginManager: Error in state change listener for ${pluginId}:`, error);
      }
    }
  }
}
