# ADR-0001: Provider Pattern

## Status

Accepted

## Context

ModelForce needs to support multiple TTS providers (Piper, Kokoro, XTTS) with different:
- Installation methods (binary, pip, docker)
- Invocation interfaces (stdin/stdout, CLI args, HTTP)
- Voice formats (ONNX, bin, model bundle)
- Platform support

## Decision

Use the **Adapter Pattern** with a common `TTSProvider` interface:

```typescript
interface TTSProvider {
  id: string;
  synthesize(text: string, options?: SynthesizeOptions): Promise<Buffer>;
  voices(): Promise<VoiceManifest[]>;
  health(): Promise<ProviderHealth>;
}
```

Each provider implements this interface through a `BackendAdapter`:

```typescript
interface BackendAdapter {
  synthesize(request: SynthesizeRequest): Promise<SynthesizeResult>;
  isInstalled(): Promise<boolean>;
}
```

## Consequences

### Positive
- Adding new providers requires only implementing the adapter
- CLI commands work with any provider via `--provider` flag
- Runtime remains provider-agnostic
- Easy to test with MockAdapter

### Negative
- Each adapter may have unique quirks
- Provider-specific features (like XTTS multilingual) need explicit support

## Alternatives Considered

1. **Provider Factory**: Rejected - premature for 3 providers
2. **Plugin System**: Rejected - adds complexity without clear benefit
3. **Direct Implementation**: Rejected - violates DRY across providers

## Notes

- Adapter pattern validated in Sprint 6 with real providers
- Each adapter uses its real invocation method (not copied from Piper)
- No abstraction leaks detected

---

*Decision made: Sprint 3*
*Validated: Sprint 6*
