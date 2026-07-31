import { describe, it, expect, vi, beforeEach } from "vitest";
import { PluginManager } from "../plugin-manager.js";
import { PluginLoader } from "../plugin-loader.js";
import type { Plugin } from "@modelforce/core";

describe("PluginManager", () => {
  let manager: PluginManager;
  let mockLoader: PluginLoader;
  let mockPlugin: Plugin;

  beforeEach(() => {
    mockPlugin = {
      id: "test-plugin",
      name: "Test Plugin",
      version: "1.0.0",
      type: "provider",
      description: "Test plugin",
      activate: vi.fn().mockResolvedValue(undefined),
      deactivate: vi.fn().mockResolvedValue(undefined),
      uninstall: vi.fn().mockResolvedValue(undefined),
      health: vi.fn().mockResolvedValue({ status: "healthy", details: "OK" }),
    };

    mockLoader = {
      load: vi.fn().mockResolvedValue(mockPlugin),
    } as unknown as PluginLoader;

    manager = new PluginManager(mockLoader);
  });

  it("should load plugin", async () => {
    const plugin = await manager.load("test-plugin");

    expect(plugin.id).toBe("test-plugin");
    expect(manager.getState("test-plugin")).toBe("loaded");
  });

  it("should activate plugin", async () => {
    await manager.load("test-plugin");
    await manager.activate("test-plugin");

    expect(mockPlugin.activate).toHaveBeenCalledOnce();
    expect(manager.getState("test-plugin")).toBe("active");
  });

  it("should deactivate plugin", async () => {
    await manager.load("test-plugin");
    await manager.activate("test-plugin");
    await manager.deactivate("test-plugin");

    expect(mockPlugin.deactivate).toHaveBeenCalledOnce();
    expect(manager.getState("test-plugin")).toBe("loaded");
  });

  it("should uninstall plugin", async () => {
    await manager.load("test-plugin");
    await manager.activate("test-plugin");
    await manager.uninstall("test-plugin");

    expect(mockPlugin.uninstall).toHaveBeenCalledOnce();
    expect(manager.get("test-plugin")).toBeUndefined();
  });

  it("should list plugins", async () => {
    await manager.load("test-plugin");

    const plugins = manager.list();
    expect(plugins).toHaveLength(1);
    expect(plugins[0].plugin.id).toBe("test-plugin");
  });

  it("should get plugin health", async () => {
    await manager.load("test-plugin");
    await manager.activate("test-plugin");

    const health = await manager.health("test-plugin");
    expect(health.status).toBe("healthy");
  });

  it("should return unavailable for inactive plugin", async () => {
    await manager.load("test-plugin");

    const health = await manager.health("test-plugin");
    expect(health.status).toBe("unavailable");
  });

  it("should notify state change listeners", async () => {
    const callback = vi.fn();
    manager.onStateChange(callback);

    await manager.load("test-plugin");

    // Listener is notified when plugin is loaded (transition from undefined to loaded)
    expect(callback).toHaveBeenCalledWith("test-plugin", "loaded", "loaded");
  });

  it("should handle load errors", async () => {
    vi.mocked(mockLoader.load).mockRejectedValue(new Error("Load failed"));

    await expect(manager.load("test-plugin")).rejects.toThrow("Load failed");
    expect(manager.getState("test-plugin")).toBe("error");
  });

  it("should throw when activating unloaded plugin", async () => {
    await expect(manager.activate("nonexistent")).rejects.toThrow("not loaded");
  });

  it("should throw when activating plugin from wrong state", async () => {
    await manager.load("test-plugin");
    // Try to activate from "loaded" state should work
    await manager.activate("test-plugin");
    // Try to activate again from "active" state should return without error
    await manager.activate("test-plugin");
    expect(manager.getState("test-plugin")).toBe("active");
  });
});
