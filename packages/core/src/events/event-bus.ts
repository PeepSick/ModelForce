import { Event, EventType, EventHandler, EventSeverity } from "../types/event.js";

export interface Disposable {
  dispose(): void;
}

export interface EventBusConfig {
  maxListeners: number;
  enableTracing: boolean;
}

const DEFAULT_EVENT_BUS_CONFIG: EventBusConfig = {
  maxListeners: 100,
  enableTracing: false,
};

export class InMemoryEventBus {
  private listeners: Map<EventType, Set<EventHandler>> = new Map();
  private wildcardListeners: Set<EventHandler> = new Set();
  private config: EventBusConfig;
  private eventHistory: Event[] = [];
  private maxHistory: number = 100;

  constructor(config?: Partial<EventBusConfig>) {
    this.config = { ...DEFAULT_EVENT_BUS_CONFIG, ...config };
  }

  emit(event: Event): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      for (const handler of typeListeners) {
        try {
          handler(event);
        } catch (error) {
          console.error(`EventBus: Error in handler for ${event.type}:`, error);
        }
      }
    }

    for (const handler of this.wildcardListeners) {
      try {
        handler(event);
      } catch (error) {
        console.error("EventBus: Error in wildcard handler:", error);
      }
    }
  }

  on(type: EventType, handler: EventHandler): Disposable {
    let listeners = this.listeners.get(type);
    if (!listeners) {
      listeners = new Set();
      this.listeners.set(type, listeners);
    }

    if (listeners.size >= this.config.maxListeners) {
      console.warn(`EventBus: Max listeners (${this.config.maxListeners}) reached for ${type}`);
    }

    listeners.add(handler);

    return {
      dispose: () => {
        listeners!.delete(handler);
        if (listeners!.size === 0) {
          this.listeners.delete(type);
        }
      },
    };
  }

  onAny(handler: EventHandler): Disposable {
    this.wildcardListeners.add(handler);

    return {
      dispose: () => {
        this.wildcardListeners.delete(handler);
      },
    };
  }

  once(type: EventType, handler: EventHandler): Disposable {
    const wrapper: EventHandler = (event) => {
      disposable.dispose();
      handler(event);
    };

    const disposable = this.on(type, wrapper);
    return disposable;
  }

  off(type: EventType, handler: EventHandler): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(type);
      }
    }
  }

  getHistory(type?: EventType, limit?: number): Event[] {
    let events = type
      ? this.eventHistory.filter((e) => e.type === type)
      : [...this.eventHistory];

    if (limit) {
      events = events.slice(-limit);
    }

    return events;
  }

  clearHistory(): void {
    this.eventHistory = [];
  }

  listenerCount(type?: EventType): number {
    if (type) {
      return this.listeners.get(type)?.size ?? 0;
    }

    let count = 0;
    for (const listeners of this.listeners.values()) {
      count += listeners.size;
    }
    count += this.wildcardListeners.size;
    return count;
  }

  removeAllListeners(type?: EventType): void {
    if (type) {
      this.listeners.delete(type);
    } else {
      this.listeners.clear();
      this.wildcardListeners.clear();
    }
  }
}

export function createEvent(
  type: EventType,
  source: string,
  data: Record<string, unknown> = {},
  severity: EventSeverity = "info"
): Event {
  return {
    type,
    timestamp: new Date(),
    source,
    data,
    severity,
  };
}
