import { RuntimeContext } from "@modelforce/core";

export interface ExecutionConfig {
  maxRetries: number;
  retryDelay: number;
  retryBackoff: "linear" | "exponential";
  timeoutMs: number;
}

export const DEFAULT_EXECUTION_CONFIG: ExecutionConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: "exponential",
  timeoutMs: 30000,
};

export class ExecutionEngine {
  private config: ExecutionConfig;

  constructor(config?: Partial<ExecutionConfig>) {
    this.config = { ...DEFAULT_EXECUTION_CONFIG, ...config };
  }

  async execute<TRequest, TResponse>(
    ctx: RuntimeContext,
    request: TRequest,
    executor: (req: TRequest) => Promise<TResponse>
  ): Promise<TResponse> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const timeoutMs = ctx.timeoutMs || this.config.timeoutMs;

        const timeoutPromise = new Promise<never>((_, reject) => {
          globalThis.setTimeout(() => reject(new Error("Timeout")), timeoutMs);
        });

        const result = await Promise.race([
          executor(request),
          timeoutPromise,
        ]);

        return result;
      } catch (error) {
        lastError = error as Error;

        ctx.logger.warn("Execution attempt failed", {
          attempt,
          maxRetries: this.config.maxRetries,
          error: lastError.message,
        });

        if (ctx.cancellationToken?.aborted) {
          throw new Error("Request cancelled");
        }

        if (attempt < this.config.maxRetries) {
          const delay =
            this.config.retryBackoff === "exponential"
              ? this.config.retryDelay * Math.pow(2, attempt)
              : this.config.retryDelay * (attempt + 1);

          ctx.logger.debug("Retrying after delay", { delayMs: delay });
          await new Promise((resolve) => globalThis.setTimeout(resolve, delay));
        }
      }
    }

    ctx.logger.error("Execution failed after all retries", {
      totalAttempts: this.config.maxRetries + 1,
      error: lastError?.message,
    });

    throw lastError;
  }

  getConfig(): ExecutionConfig {
    return { ...this.config };
  }
}
