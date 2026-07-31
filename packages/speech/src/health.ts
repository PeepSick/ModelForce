import { TTSProvider, HealthStatus } from "@modelforce/core";

export class HealthMonitor {
  private healthCache: Map<string, HealthStatus> = new Map();
  private checkInterval: number = 30000;
  private intervalId: NodeJS.Timeout | null = null;

  start(providers: Map<string, TTSProvider>): void {
    this.intervalId = setInterval(async () => {
      for (const [id, provider] of providers) {
        try {
          const health = await provider.health();
          this.healthCache.set(id, health);
        } catch (error) {
          this.healthCache.set(id, {
            status: "unavailable",
            latency: 0,
            lastCheck: new Date(),
            error: (error as Error).message,
          });
        }
      }
    }, this.checkInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getHealth(providerId: string): HealthStatus | undefined {
    return this.healthCache.get(providerId);
  }

  getAllHealth(): Map<string, HealthStatus> {
    return new Map(this.healthCache);
  }

  isHealthy(providerId: string): boolean {
    const health = this.healthCache.get(providerId);
    return health?.status === "healthy";
  }
}