import { HealthStatus } from "../types/provider.js";
import { Disposable } from "../events/event-bus.js";

export interface HealthCheck {
  id: string;
  check(): Promise<HealthStatus>;
  interval?: number;
}

export interface HealthMonitorConfig {
  checkInterval: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

export type HealthStatusChangeCallback = (
  id: string,
  previous: HealthStatus | null,
  current: HealthStatus
) => void;

const DEFAULT_HEALTH_CONFIG: HealthMonitorConfig = {
  checkInterval: 30000,
  unhealthyThreshold: 3,
  healthyThreshold: 1,
};

interface HealthCheckEntry {
  check: HealthCheck;
  status: HealthStatus | null;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  intervalId: ReturnType<typeof setInterval> | null;
}

export class HealthMonitor {
  private checks: Map<string, HealthCheckEntry> = new Map();
  private config: HealthMonitorConfig;
  private statusListeners: Set<HealthStatusChangeCallback> = new Set();
  private running: boolean = false;

  constructor(config?: Partial<HealthMonitorConfig>) {
    this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };
  }

  registerCheck(check: HealthCheck): void {
    if (this.checks.has(check.id)) {
      throw new Error(`Health check already registered: ${check.id}`);
    }

    this.checks.set(check.id, {
      check,
      status: null,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      intervalId: null,
    });
  }

  unregisterCheck(id: string): void {
    const entry = this.checks.get(id);
    if (entry) {
      if (entry.intervalId) {
        clearInterval(entry.intervalId);
      }
      this.checks.delete(id);
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    for (const [id, entry] of this.checks) {
      const interval = entry.check.interval ?? this.config.checkInterval;

      entry.intervalId = setInterval(async () => {
        await this.runCheck(id, entry);
      }, interval);

      this.runCheck(id, entry);
    }
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;

    for (const entry of this.checks.values()) {
      if (entry.intervalId) {
        clearInterval(entry.intervalId);
        entry.intervalId = null;
      }
    }
  }

  async checkNow(id: string): Promise<HealthStatus> {
    const entry = this.checks.get(id);
    if (!entry) {
      throw new Error(`Health check not found: ${id}`);
    }

    const status = await entry.check.check();
    this.updateStatus(entry, status);
    return status;
  }

  async checkAll(): Promise<Map<string, HealthStatus>> {
    const results = new Map<string, HealthStatus>();

    for (const [id, entry] of this.checks) {
      try {
        const status = await entry.check.check();
        this.updateStatus(entry, status);
        results.set(id, status);
      } catch (error) {
        const errorStatus: HealthStatus = {
          status: "unavailable",
          latency: 0,
          lastCheck: new Date(),
          error: (error as Error).message,
        };
        this.updateStatus(entry, errorStatus);
        results.set(id, errorStatus);
      }
    }

    return results;
  }

  getStatus(id: string): HealthStatus | null {
    return this.checks.get(id)?.status ?? null;
  }

  getAllStatus(): Map<string, HealthStatus> {
    const results = new Map<string, HealthStatus>();
    for (const [id, entry] of this.checks) {
      if (entry.status) {
        results.set(id, entry.status);
      }
    }
    return results;
  }

  isHealthy(id: string): boolean {
    const status = this.checks.get(id)?.status;
    return status?.status === "healthy";
  }

  onStatusChange(callback: HealthStatusChangeCallback): Disposable {
    this.statusListeners.add(callback);
    return {
      dispose: () => {
        this.statusListeners.delete(callback);
      },
    };
  }

  private async runCheck(id: string, entry: HealthCheckEntry): Promise<void> {
    try {
      const status = await entry.check.check();
      this.updateStatus(entry, status);
    } catch (error) {
      const errorStatus: HealthStatus = {
        status: "unavailable",
        latency: 0,
        lastCheck: new Date(),
        error: (error as Error).message,
      };
      this.updateStatus(entry, errorStatus);
    }
  }

  private updateStatus(entry: HealthCheckEntry, newStatus: HealthStatus): void {
    const previousStatus = entry.status;

    if (newStatus.status === "unavailable" || newStatus.status === "degraded") {
      entry.consecutiveFailures++;
      entry.consecutiveSuccesses = 0;
    } else {
      entry.consecutiveSuccesses++;
      entry.consecutiveFailures = 0;
    }

    let effectiveStatus = newStatus.status;

    if (
      entry.consecutiveFailures >= this.config.unhealthyThreshold &&
      newStatus.status !== "unavailable"
    ) {
      effectiveStatus = "degraded";
    }

    if (
      previousStatus?.status !== effectiveStatus
    ) {
      entry.status = { ...newStatus, status: effectiveStatus };

      for (const listener of this.statusListeners) {
        try {
          listener(entry.check.id, previousStatus, entry.status);
        } catch (error) {
          console.error("HealthMonitor: Error in status change listener:", error);
        }
      }
    } else {
      entry.status = { ...newStatus, status: effectiveStatus };
    }
  }
}
