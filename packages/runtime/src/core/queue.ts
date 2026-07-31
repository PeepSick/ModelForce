import { RequestPriority, QueueStatus } from "@modelforce/core";

export interface QueueItem<T> {
  id: string;
  data: T;
  priority: RequestPriority;
  addedAt: Date;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
}

export class RequestQueue<T> {
  private queue: QueueItem<T>[] = [];
  private maxSize: number;
  private processing: number = 0;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  async enqueue(data: T, id: string, priority: RequestPriority): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxSize) {
        reject(new Error("Queue overflow: max size " + this.maxSize + " reached"));
        return;
      }

      this.queue.push({
        id,
        data,
        priority,
        addedAt: new Date(),
        resolve,
        reject,
      });

      this.queue.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
    });
  }

  dequeue(): QueueItem<T> | undefined {
    return this.queue.shift();
  }

  peek(): QueueItem<T> | undefined {
    return this.queue[0];
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  getStatus(): QueueStatus {
    return {
      pending: this.queue.length,
      processing: this.processing,
      completed: 0,
      failed: 0,
      byProvider: {},
    };
  }

  private getPriorityValue(priority: RequestPriority): number {
    const values: Record<RequestPriority, number> = {
      realtime: 0,
      streaming: 1,
      batch: 2,
      background: 3,
    };
    return values[priority];
  }
}