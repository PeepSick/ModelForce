import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitBreakerError,
} from "../health/circuit-breaker.js";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker("test", {
      failureThreshold: 3,
      resetTimeout: 1000,
      halfOpenMaxAttempts: 1,
    });
  });

  it("should start in closed state", () => {
    expect(breaker.getState()).toBe("closed");
    expect(breaker.getName()).toBe("test");
  });

  it("should remain closed after successful execution", async () => {
    await breaker.execute(async () => "success");
    expect(breaker.getState()).toBe("closed");
    expect(breaker.getFailureCount()).toBe(0);
  });

  it("should open after reaching failure threshold", async () => {
    const failingFn = vi.fn().mockRejectedValue(new Error("fail"));

    for (let i = 0; i < 3; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // expected
      }
    }

    expect(breaker.getState()).toBe("open");
    expect(breaker.getFailureCount()).toBe(3);
  });

  it("should throw when open", async () => {
    breaker.trip();

    await expect(breaker.execute(async () => "success")).rejects.toThrow(
      CircuitBreakerError
    );
  });

  it("should transition to half-open after reset timeout", async () => {
    breaker.trip();

    // Mock time to simulate timeout
    const originalNow = Date.now;
    let currentTime = Date.now();
    Date.now = () => currentTime;

    // Still open
    expect(breaker.getState()).toBe("open");

    // Advance time past resetTimeout
    currentTime += 1001;

    // Should transition to half-open
    expect(breaker.getState()).toBe("half-open");

    Date.now = originalNow;
  });

  it("should close after successful half-open execution", async () => {
    breaker.trip();

    // Mock time to simulate timeout
    const originalNow = Date.now;
    let currentTime = Date.now();
    Date.now = () => currentTime;
    currentTime += 1001;

    // Now in half-open
    expect(breaker.getState()).toBe("half-open");

    // Successful execution
    await breaker.execute(async () => "success");

    // Should close
    expect(breaker.getState()).toBe("closed");

    Date.now = originalNow;
  });

  it("should reset failure count on success", async () => {
    const failingFn = vi.fn().mockRejectedValue(new Error("fail"));

    // Fail twice
    for (let i = 0; i < 2; i++) {
      try {
        await breaker.execute(failingFn);
      } catch {
        // expected
      }
    }

    expect(breaker.getFailureCount()).toBe(2);

    // Success resets count
    await breaker.execute(async () => "success");
    expect(breaker.getFailureCount()).toBe(0);
  });

  it("should reset manually", () => {
    breaker.trip();
    expect(breaker.getState()).toBe("open");

    breaker.reset();
    expect(breaker.getState()).toBe("closed");
    expect(breaker.getFailureCount()).toBe(0);
  });

  it("should notify state change listeners", () => {
    const callback = vi.fn();
    breaker.onStateChange(callback);

    breaker.trip();

    expect(callback).toHaveBeenCalledWith("test", "closed", "open");
  });

  it("should dispose state change listener", () => {
    const callback = vi.fn();
    const disposable = breaker.onStateChange(callback);

    disposable.dispose();
    breaker.trip();

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("CircuitBreakerRegistry", () => {
  let registry: CircuitBreakerRegistry;

  beforeEach(() => {
    registry = new CircuitBreakerRegistry();
  });

  it("should create new circuit breaker", () => {
    const breaker = registry.getOrCreate("test");

    expect(breaker).toBeInstanceOf(CircuitBreaker);
    expect(breaker.getName()).toBe("test");
    expect(registry.has("test")).toBe(true);
  });

  it("should return existing circuit breaker", () => {
    const breaker1 = registry.getOrCreate("test");
    const breaker2 = registry.getOrCreate("test");

    expect(breaker1).toBe(breaker2);
  });

  it("should get circuit breaker", () => {
    registry.getOrCreate("test");

    expect(registry.get("test")).toBeInstanceOf(CircuitBreaker);
    expect(registry.get("nonexistent")).toBeUndefined();
  });

  it("should check if circuit breaker exists", () => {
    expect(registry.has("test")).toBe(false);

    registry.getOrCreate("test");

    expect(registry.has("test")).toBe(true);
  });

  it("should remove circuit breaker", () => {
    registry.getOrCreate("test");

    expect(registry.remove("test")).toBe(true);
    expect(registry.has("test")).toBe(false);
  });

  it("should get all circuit breakers", () => {
    registry.getOrCreate("test1");
    registry.getOrCreate("test2");

    const all = registry.getAll();
    expect(all.size).toBe(2);
  });

  it("should reset all circuit breakers", () => {
    const breaker1 = registry.getOrCreate("test1");
    const breaker2 = registry.getOrCreate("test2");

    breaker1.trip();
    breaker2.trip();

    registry.resetAll();

    expect(breaker1.getState()).toBe("closed");
    expect(breaker2.getState()).toBe("closed");
  });
});

describe("CircuitBreakerError", () => {
  it("should have correct properties", () => {
    const error = new CircuitBreakerError("test", "open");

    expect(error.name).toBe("CircuitBreakerError");
    expect(error.circuitName).toBe("test");
    expect(error.circuitState).toBe("open");
    expect(error.message).toContain("test");
    expect(error.message).toContain("open");
  });
});
