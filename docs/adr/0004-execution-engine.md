# ADR-0004: Execution Engine

## Status

Accepted

## Context

TTS synthesis can fail due to:
- Network issues (XTTS server)
- Binary crashes (Piper)
- Invalid input
- Resource exhaustion

The system needs:
- Retry logic with backoff
- Timeout handling
- Cancellation support
- Observability

## Decision

Implement `ExecutionEngine` with configurable retry and timeout:

```typescript
class ExecutionEngine {
  async execute<TRequest, TResponse>(
    ctx: RuntimeContext,
    request: TRequest,
    executor: (req: TRequest) => Promise<TResponse>
  ): Promise<TResponse>;
}
```

Features:
- Exponential backoff retry
- Configurable timeout per request
- Cancellation via AbortController
- Structured logging

## Consequences

### Positive
- Resilient to transient failures
- Predictable latency (timeout)
- Clean cancellation support
- Observable execution flow

### Negative
- Added complexity for simple cases
- Timeout may be too aggressive for long texts

## Alternatives Considered

1. **No Retry**: Rejected - too fragile
2. **Simple Retry**: Rejected - no backoff, no timeout
3. **External Library**: Rejected - adds dependency

## Configuration

```typescript
const engine = new ExecutionEngine({
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: "exponential",
  timeoutMs: 30000,
});
```

## Usage

```typescript
const audio = await engine.execute(ctx, text, (t) =>
  provider.synthesize(t, { voice })
);
```

---

*Decision made: Sprint 3*
