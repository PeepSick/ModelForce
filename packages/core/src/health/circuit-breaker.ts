import { Disposable } from "../events/event-bus.js";

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenMaxAttempts: number;
}

export type CircuitStateChangeCallback = (
  name: string,
  previous: CircuitState,
  current: CircuitState
) => void;

const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000,
  halfOpenMaxAttempts: 1,
};

export class CircuitBreakerError extends Error {
  public readonly circuitName: string;
  public readonly circuitState: CircuitState;

  constructor(circuitName: string, state: CircuitState) {
    super(`Circuit breaker "${circuitName}" is ${state}`);
    this.name = "CircuitBreakerError";
    this.circuitName = circuitName;
    this.circuitState = state;
  }
}

export class CircuitBreaker {
  private name: string;
  private config: CircuitBreakerConfig;
  private state: CircuitState = "closed";
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private halfOpenAttempts: number = 0;
  private stateListeners: Set<CircuitStateChangeCallback> = new Set();

  constructor(name: string, config?: Partial<CircuitBreakerConfig>) {
    this.name = name;
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
  }

  getState(): CircuitState {
    if (this.state === "open") {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.config.resetTimeout) {
        this.transitionTo("half-open");
      }
    }
    return this.state;
  }

  getName(): string {
    return this.name;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === "open") {
      throw new CircuitBreakerError(this.name, "open");
    }

    if (currentState === "half-open") {
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        throw new CircuitBreakerError(this.name, "half-open");
      }
      this.halfOpenAttempts++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess(): void {
    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.config.halfOpenMaxAttempts) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }

  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "half-open") {
      this.transitionTo("open");
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionTo("open");
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.successCount = 0;
    this.halfOpenAttempts = 0;
    this.transitionTo("closed");
  }

  trip(): void {
    this.lastFailureTime = Date.now();
    this.transitionTo("open");
  }

  onStateChange(callback: CircuitStateChangeCallback): Disposable {
    this.stateListeners.add(callback);
    return {
      dispose: () => {
        this.stateListeners.delete(callback);
      },
    };
  }

  private transitionTo(newState: CircuitState): void {
    if (this.state === newState) return;

    const previous = this.state;
    this.state = newState;

    if (newState === "half-open") {
      this.halfOpenAttempts = 0;
      this.successCount = 0;
    }

    for (const listener of this.stateListeners) {
      try {
        listener(this.name, previous, newState);
      } catch (error) {
        console.error(`CircuitBreaker: Error in state change listener for ${this.name}:`, error);
      }
    }
  }
}

export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();
  private defaultConfig: Partial<CircuitBreakerConfig>;

  constructor(defaultConfig?: Partial<CircuitBreakerConfig>) {
    this.defaultConfig = defaultConfig ?? {};
  }

  getOrCreate(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker(name, { ...this.defaultConfig, ...config });
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  has(name: string): boolean {
    return this.breakers.has(name);
  }

  remove(name: string): boolean {
    return this.breakers.delete(name);
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}
