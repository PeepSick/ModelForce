import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HealthMonitor } from "../health/health-monitor.js";
import type { HealthCheck, HealthStatus } from "../types/provider.js";

describe("HealthMonitor", () => {
  let monitor: HealthMonitor;

  beforeEach(() => {
    monitor = new HealthMonitor({
      checkInterval: 100,
      unhealthyThreshold: 3,
      healthyThreshold: 1,
    });
  });

  afterEach(() => {
    monitor.stop();
  });

  it("should register health check", () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);

    expect(monitor.getStatus("test")).toBeNull();
  });

  it("should throw on duplicate registration", () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);

    expect(() => monitor.registerCheck(check)).toThrow("already registered");
  });

  it("should unregister health check", () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    monitor.unregisterCheck("test");

    expect(monitor.getStatus("test")).toBeNull();
  });

  it("should run check now", async () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    const status = await monitor.checkNow("test");

    expect(status.status).toBe("healthy");
    expect(status.latency).toBe(10);
  });

  it("should throw for unknown check", async () => {
    await expect(monitor.checkNow("unknown")).rejects.toThrow("not found");
  });

  it("should check all", async () => {
    const check1: HealthCheck = {
      id: "test1",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };
    const check2: HealthCheck = {
      id: "test2",
      check: async () => ({ status: "degraded", latency: 50, lastCheck: new Date() }),
    };

    monitor.registerCheck(check1);
    monitor.registerCheck(check2);

    const results = await monitor.checkAll();

    expect(results.size).toBe(2);
    expect(results.get("test1")?.status).toBe("healthy");
    expect(results.get("test2")?.status).toBe("degraded");
  });

  it("should handle check errors in checkAll", async () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => {
        throw new Error("Check failed");
      },
    };

    monitor.registerCheck(check);
    const results = await monitor.checkAll();
    const status = results.get("test");

    expect(status?.status).toBe("unavailable");
    expect(status?.error).toBe("Check failed");
  });

  it("should throw error in checkNow", async () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => {
        throw new Error("Check failed");
      },
    };

    monitor.registerCheck(check);
    await expect(monitor.checkNow("test")).rejects.toThrow("Check failed");
  });

  it("should track health status", async () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    await monitor.checkNow("test");

    expect(monitor.isHealthy("test")).toBe(true);
    expect(monitor.getAllStatus().size).toBe(1);
  });

  it("should notify status change listeners", async () => {
    const callback = vi.fn();
    monitor.onStatusChange(callback);

    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    await monitor.checkNow("test");

    expect(callback).toHaveBeenCalledWith(
      "test",
      null,
      expect.objectContaining({ status: "healthy" })
    );
  });

  it("should dispose status change listener", async () => {
    const callback = vi.fn();
    const disposable = monitor.onStatusChange(callback);

    disposable.dispose();

    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    await monitor.checkNow("test");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should start and stop monitoring", async () => {
    const check: HealthCheck = {
      id: "test",
      check: async () => ({ status: "healthy", latency: 10, lastCheck: new Date() }),
    };

    monitor.registerCheck(check);
    monitor.start();

    // Wait for at least one check
    await new Promise((resolve) => setTimeout(resolve, 150));

    monitor.stop();

    expect(monitor.getStatus("test")).not.toBeNull();
  });
});
