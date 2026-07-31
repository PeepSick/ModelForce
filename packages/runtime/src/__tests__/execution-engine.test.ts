import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionEngine, DEFAULT_EXECUTION_CONFIG } from "../core/execution-engine.js";
import type { RuntimeContext } from "@modelforce/core";

describe("ExecutionEngine", () => {
  let engine: ExecutionEngine;
  let ctx: RuntimeContext;

  beforeEach(() => {
    engine = new ExecutionEngine({
      maxRetries: 2,
      retryDelay: 100,
      retryBackoff: "linear",
      timeoutMs: 5000,
    });

    ctx = {
      requestId: "test-123",
      text: "hello",
      options: {},
      startTime: Date.now(),
      metrics: {
        tokensIn: 0,
        tokensOut: 0,
        durationMs: 0,
        model: "test",
      },
      logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
      },
      timeoutMs: 5000,
      cancellationToken: { aborted: false },
    };
  });

  it("should execute successfully", async () => {
    const executor = vi.fn().mockResolvedValue("success");

    const result = await engine.execute(ctx, "request", executor);

    expect(result).toBe("success");
    expect(executor).toHaveBeenCalledOnce();
  });

  it("should retry on failure", async () => {
    const executor = vi.fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue("success");

    const result = await engine.execute(ctx, "request", executor);

    expect(result).toBe("success");
    expect(executor).toHaveBeenCalledTimes(3);
  });

  it("should throw after max retries", async () => {
    const executor = vi.fn().mockRejectedValue(new Error("fail"));

    await expect(engine.execute(ctx, "request", executor)).rejects.toThrow("fail");
    expect(executor).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("should respect timeout", async () => {
    const executor = vi.fn().mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 10000))
    );

    ctx.timeoutMs = 100;

    await expect(engine.execute(ctx, "request", executor)).rejects.toThrow("Timeout");
  });

  it("should abort on cancellation", async () => {
    const executor = vi.fn().mockRejectedValue(new Error("fail"));
    ctx.cancellationToken = { aborted: true };

    await expect(engine.execute(ctx, "request", executor)).rejects.toThrow("cancelled");
  });

  it("should use exponential backoff", async () => {
    engine = new ExecutionEngine({
      maxRetries: 2,
      retryDelay: 100,
      retryBackoff: "exponential",
      timeoutMs: 5000,
    });

    const executor = vi.fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue("success");

    const start = Date.now();
    await engine.execute(ctx, "request", executor);
    const elapsed = Date.now() - start;

    // Should have delays of 100ms and 200ms = ~300ms total
    expect(elapsed).toBeGreaterThanOrEqual(250);
  });

  it("should return config copy", () => {
    const config = engine.getConfig();
    expect(config).toEqual({
      maxRetries: 2,
      retryDelay: 100,
      retryBackoff: "linear",
      timeoutMs: 5000,
    });

    // Modifying copy shouldn't affect engine
    config.maxRetries = 999;
    expect(engine.getConfig().maxRetries).toBe(2);
  });
});

describe("DEFAULT_EXECUTION_CONFIG", () => {
  it("should have sensible defaults", () => {
    expect(DEFAULT_EXECUTION_CONFIG.maxRetries).toBe(3);
    expect(DEFAULT_EXECUTION_CONFIG.retryDelay).toBe(1000);
    expect(DEFAULT_EXECUTION_CONFIG.retryBackoff).toBe("exponential");
    expect(DEFAULT_EXECUTION_CONFIG.timeoutMs).toBe(30000);
  });
});
