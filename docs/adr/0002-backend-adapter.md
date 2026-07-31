# ADR-0002: Backend Adapter

## Status

Accepted

## Context

Different TTS providers have different invocation interfaces:
- Piper: `echo "text" | piper --model model.onnx --output_file output.wav`
- Kokoro: `kokoro "text" --output output.wav`
- XTTS: `POST http://localhost:5002/api/tts`

The adapter must handle these differences without leaking into the runtime.

## Decision

Create provider-specific adapters that implement `BackendAdapter`:

```typescript
// ProcessAdapter for CLI-based providers
class ProcessAdapter implements BackendAdapter {
  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    // Spawn process, pipe input, capture output
  }
}

// HttpAdapter for API-based providers
class HttpAdapter implements BackendAdapter {
  async synthesize(request: SynthesizeRequest): Promise<SynthesizeResult> {
    // HTTP POST to provider API
  }
}
```

Each adapter:
1. Handles provider-specific interface
2. Returns standardized `SynthesizeResult`
3. Manages provider-specific voice discovery

## Consequences

### Positive
- Each adapter uses real provider interface
- No hacks or workarounds in runtime
- Easy to add new adapter types (e.g., gRPC)

### Negative
- Each adapter is provider-specific
- Testing requires mocking at adapter level

## Alternatives Considered

1. **Unified CLI Interface**: Rejected - providers don't support this
2. **Wrapper Scripts**: Rejected - adds dependency on external scripts
3. **Runtime Adaptation**: Rejected - too complex, violates separation

## Implementation Details

### PiperAdapter
- stdin/stdout communication
- ONNX model files
- JSON config files

### KokoroAdapter
- Positional text argument
- `--output` flag for output file
- Voice files in .bin format

### XttsAdapter
- HTTP POST to `/api/tts`
- JSON request/response
- Optional speaker WAV for voice cloning

---

*Decision made: Sprint 3*
*Validated: Sprint 6*
