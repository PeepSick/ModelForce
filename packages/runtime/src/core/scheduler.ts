import { RequestQueue, QueueItem } from "./queue.js";
import { RequestPriority } from "@modelforce/core";

export interface SchedulerConfig {
  maxConcurrent: number;
  maxPerProvider: number;
}

export class Scheduler<T> {
  private queue: RequestQueue<T>;
  private config: SchedulerConfig;
  private active: Map<string, QueueItem<T>> = new Map();
  private providerCounts: Map<string, number> = new Map();

  constructor(queue: RequestQueue<T>, config: SchedulerConfig) {
    this.queue = queue;
    this.config = config;
  }

  async schedule(data: T, id: string, priority: RequestPriority, provider?: string): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.active.size >= this.config.maxConcurrent) {
        reject(new Error("Max concurrent limit reached"));
        return;
      }

      if (provider) {
        const count = this.providerCounts.get(provider) || 0;
        if (count >= this.config.maxPerProvider) {
          reject(new Error("Max per provider limit reached for " + provider));
          return;
        }
      }

      this.queue.enqueue(data, id, priority).then(resolve).catch(reject);
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    const item = this.queue.dequeue();
    if (!item) return;

    this.active.set(item.id, item);

    try {
      item.resolve(item.data);
    } catch (error) {
      item.reject(error as Error);
    } finally {
      this.active.delete(item.id);
      this.processNext();
    }
  }

  cancel(id: string): boolean {
    const item = this.active.get(id);
    if (item) {
      item.reject(new Error("Request cancelled"));
      this.active.delete(id);
      return true;
    }
    return false;
  }

  getActiveCount(): number {
    return this.active.size;
  }
}