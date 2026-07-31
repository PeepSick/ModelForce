# @modelforce/core

Core types, interfaces, and errors for ModelForce.

## Installation

```bash
pnpm add @modelforce/core
```

## Usage

```typescript
import type { TTSProvider, SynthesizeOptions, VoiceManifest } from "@modelforce/core";
```

## API

### Types

- `TTSProvider` - Provider interface
- `SynthesizeOptions` - Synthesis options
- `VoiceManifest` - Voice metadata
- `AudioChunk` - Streaming audio chunk
- `HealthStatus` - Health check result

### Events

- `EventBus` - Event system interface
- `Event` - Event data structure

### Health

- `HealthMonitor` - Periodic health checks
- `CircuitBreaker` - Failure tracking
- `CircuitBreakerRegistry` - Per-provider breakers

## License

MIT
