import { describe, it, expect, vi } from "vitest";
import { InMemoryEventBus, createEvent } from "../events/event-bus.js";
import type { Event } from "../types/event.js";

describe("InMemoryEventBus", () => {
  it("should emit and receive events", () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.on("synthesize:request", handler);
    const event = createEvent("synthesize:request", "test", { text: "hello" });
    bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should support multiple handlers for same event type", () => {
    const bus = new InMemoryEventBus();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on("synthesize:request", handler1);
    bus.on("synthesize:request", handler2);

    const event = createEvent("synthesize:request", "test");
    bus.emit(event);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it("should support wildcard handlers", () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.onAny(handler);

    const event = createEvent("synthesize:request", "test");
    bus.emit(event);

    expect(handler).toHaveBeenCalledWith(event);
  });

  it("should dispose handlers", () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    const disposable = bus.on("synthesize:request", handler);
    disposable.dispose();

    const event = createEvent("synthesize:request", "test");
    bus.emit(event);

    expect(handler).not.toHaveBeenCalled();
  });

  it("should support once handlers", () => {
    const bus = new InMemoryEventBus();
    const handler = vi.fn();

    bus.once("synthesize:request", handler);

    const event1 = createEvent("synthesize:request", "test");
    const event2 = createEvent("synthesize:request", "test");

    bus.emit(event1);
    bus.emit(event2);

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith(event1);
  });

  it("should track event history", () => {
    const bus = new InMemoryEventBus();

    const event1 = createEvent("synthesize:request", "test");
    const event2 = createEvent("synthesize:complete", "test");

    bus.emit(event1);
    bus.emit(event2);

    const history = bus.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toBe(event1);
    expect(history[1]).toBe(event2);
  });

  it("should filter history by type", () => {
    const bus = new InMemoryEventBus();

    const event1 = createEvent("synthesize:request", "test");
    const event2 = createEvent("synthesize:complete", "test");
    const event3 = createEvent("synthesize:request", "test");

    bus.emit(event1);
    bus.emit(event2);
    bus.emit(event3);

    const history = bus.getHistory("synthesize:request");
    expect(history).toHaveLength(2);
  });

  it("should limit history", () => {
    const bus = new InMemoryEventBus();

    for (let i = 0; i < 10; i++) {
      bus.emit(createEvent("synthesize:request", "test"));
    }

    const history = bus.getHistory(undefined, 5);
    expect(history).toHaveLength(5);
  });

  it("should clear history", () => {
    const bus = new InMemoryEventBus();

    bus.emit(createEvent("synthesize:request", "test"));
    bus.clearHistory();

    expect(bus.getHistory()).toHaveLength(0);
  });

  it("should count listeners", () => {
    const bus = new InMemoryEventBus();

    bus.on("synthesize:request", vi.fn());
    bus.on("synthesize:request", vi.fn());
    bus.on("synthesize:complete", vi.fn());

    expect(bus.listenerCount("synthesize:request")).toBe(2);
    expect(bus.listenerCount("synthesize:complete")).toBe(1);
    expect(bus.listenerCount()).toBe(3);
  });

  it("should remove all listeners", () => {
    const bus = new InMemoryEventBus();

    bus.on("synthesize:request", vi.fn());
    bus.on("synthesize:complete", vi.fn());

    bus.removeAllListeners();

    expect(bus.listenerCount()).toBe(0);
  });

  it("should remove listeners by type", () => {
    const bus = new InMemoryEventBus();

    bus.on("synthesize:request", vi.fn());
    bus.on("synthesize:complete", vi.fn());

    bus.removeAllListeners("synthesize:request");

    expect(bus.listenerCount("synthesize:request")).toBe(0);
    expect(bus.listenerCount("synthesize:complete")).toBe(1);
  });
});

describe("createEvent", () => {
  it("should create event with defaults", () => {
    const event = createEvent("synthesize:request", "test");

    expect(event.type).toBe("synthesize:request");
    expect(event.source).toBe("test");
    expect(event.data).toEqual({});
    expect(event.severity).toBe("info");
    expect(event.timestamp).toBeInstanceOf(Date);
  });

  it("should create event with custom data", () => {
    const event = createEvent("synthesize:request", "test", { text: "hello" }, "warning");

    expect(event.data).toEqual({ text: "hello" });
    expect(event.severity).toBe("warning");
  });
});
