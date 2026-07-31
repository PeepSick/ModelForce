export interface ConcurrencyConfig {
  maxConcurrent: number;
  maxPerProvider: number;
}

export class ConcurrencyManager {
  private config: ConcurrencyConfig;
  private active: Set<string> = new Set();
  private providerCounts: Map<string, number> = new Map();

  constructor(config: ConcurrencyConfig) {
    this.config = config;
  }

  acquire(id: string, provider?: string): boolean {
    if (this.active.size >= this.config.maxConcurrent) {
      return false;
    }

    if (provider) {
      const count = this.providerCounts.get(provider) || 0;
      if (count >= this.config.maxPerProvider) {
        return false;
      }
      this.providerCounts.set(provider, count + 1);
    }

    this.active.add(id);
    return true;
  }

  release(id: string, provider?: string): void {
    this.active.delete(id);

    if (provider) {
      const count = this.providerCounts.get(provider) || 0;
      if (count > 0) {
        this.providerCounts.set(provider, count - 1);
      }
    }
  }

  isAcquired(id: string): boolean {
    return this.active.has(id);
  }

  getActiveCount(): number {
    return this.active.size;
  }

  getProviderCount(provider: string): number {
    return this.providerCounts.get(provider) || 0;
  }
}
