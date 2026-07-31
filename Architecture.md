# ModelForce Architecture

> **Implementation drives architecture. No premature abstractions.**

## Status

Current Version: v0.1.0-alpha

Stability: Alpha

API Stability: Experimental

## Request Flow

The core flow when a user runs `modelforce synthesize`:

```
modelforce synthesize "Merhaba dünya"
        ↓
      CLI
        ↓
  Execution Engine
        ↓
    Queue Manager
        ↓
   Provider Router
        ↓
     Provider
        ↓
  Backend Adapter
        ↓
   Piper CLI / HTTP
        ↓
     Audio Buffer
        ↓
     WAV File
```

## Principles

1. **Implementation drives architecture** - Real provider interfaces shape the code
2. **No premature abstractions** - Each provider uses its real invocation method
3. **Adapter pattern** - Providers expose `TTSProvider` interface, adapters handle implementation
4. **Provider independence** - Provider packages don't know about downloads/installation
5. **Namespace voices** - Voice IDs use `provider/voice-id` format
6. **Clean separation** - Core types, runtime, registry, plugins, CLI are independent

## Package Structure

```
modelforce/
├── packages/
│   ├── core/           # Types, interfaces, event bus, health monitoring
│   ├── runtime/        # ExecutionEngine, queue, scheduler
│   ├── registry/       # ProviderDiscovery, RegistryProvider
│   ├── plugin/         # PluginManager, PluginLoader
│   ├── speech/         # SpeechRuntime
│   ├── character/      # CharacterManager, CharacterLoader, CharacterValidator
│   ├── installer/      # Binary/model installation
│   └── cli/            # CLI commands
├── providers/
│   ├── provider-piper/    # Piper TTS adapter
│   ├── provider-kokoro/   # Kokoro TTS adapter
│   └── provider-xtts/     # XTTS TTS adapter
├── turbo.json
├── tsconfig.base.json
└── pnpm-workspace.yaml
```

## Compatibility Matrix

| Provider | Windows | Linux | macOS | Interface | Notes |
|----------|---------|-------|-------|-----------|-------|
| Piper | ⚠️ Binary issue | ✅ | ✅ | stdin/stdout | Binary crashes on Windows (0xC0000409) |
| Kokoro | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial | CLI args | Requires Python + kokoro-onnx |
| XTTS | ✅ | ✅ | ✅ | HTTP POST | Server required, startup latency |
| OpenVoice | ❌ | ❌ | ❌ | Not implemented | Planned |
| Fish Speech | ❌ | ❌ | ❌ | Not implemented | Planned |
| Chatterbox | ❌ | ❌ | ❌ | Not implemented | Planned |
| StyleTTS2 | ❌ | ❌ | ❌ | Not implemented | Planned |

## Execution Engine

The heart of the system - manages request lifecycle:

```
CLI Request
      ↓
┌─────────────────────────────────────────┐
│           Execution Engine              │
├─────────────────────────────────────────┤
│  1. Validate request                    │
│  2. Check circuit breaker               │
│  3. Add to queue (priority-based)       │
│  4. Schedule for execution              │
│  5. Route to provider                   │
│  6. Execute with retry + timeout        │
│  7. Collect metrics                     │
│  8. Return result or error              │
└─────────────────────────────────────────┘
      ↓
   Provider
      ↓
  Audio Buffer
```

### Features
- **Priority queue**: realtime > streaming > batch > background
- **Circuit breaker**: Per-provider failure tracking
- **Retry with backoff**: Exponential or linear
- **Timeout**: Per-request configurable
- **Cancellation**: AbortController support
- **Metrics**: Latency, throughput, error rates

## Registry System

Provider and voice discovery:

```
RegistryProvider (interface)
        ↓
┌───────────────────────────────────────┐
│  RegistryManager                      │
├───────────────────────────────────────┤
│  1. LocalRegistry (filesystem)        │
│  2. RemoteRegistry (HTTP API)         │
│  3. MirrorRegistry (cached remote)    │
│  4. NpmRegistry (node_modules)        │
└───────────────────────────────────────┘
        ↓
  Provider Discovery
        ↓
  Voice Discovery
```

### Discovery Order
1. Explicit paths (user-specified)
2. Local filesystem (`~/.modelforce/`)
3. Remote registry (HTTP)
4. npm packages (node_modules)

## Provider Architecture

### Adapter Pattern

```
TTSProvider (interface)
        ↓
PiperProvider / KokoroProvider / XttsProvider
        ↓
BackendAdapter (interface)
        ↓
ProcessAdapter / HttpAdapter / MockAdapter
```

Each provider package:
1. Implements `TTSProvider` interface
2. Uses a `BackendAdapter` for actual invocation
3. Has ProcessAdapter for real binary execution
4. Has HttpAdapter for API-based providers
5. Has MockAdapter for testing

### Provider Packages

#### Provider-Piper
- **Real invocation**: stdin/stdout with ONNX model
- **CLI**: `echo "text" | piper --model model.onnx --output_file output.wav`
- **Binary**: Downloaded via `modelforce pull piper`
- **Status**: ✅ Works on Linux/macOS, ⚠️ Windows binary issue

#### Provider-Kokoro
- **Real invocation**: CLI with positional text argument
- **CLI**: `kokoro "text" --output output.wav --voice voice_id`
- **Installation**: `pip install kokoro-onnx`
- **Status**: ⚠️ Partial - requires Python, voice format differs

#### Provider-XTTS
- **Real invocation**: HTTP POST to `/api/tts` or CLI
- **HTTP**: `POST http://localhost:5002/api/tts` with JSON body
- **Installation**: `pip install TTS` + start server
- **Status**: ⚠️ Partial - requires server, startup latency

## Core Types

### Runtime Types (`packages/core/src/types/runtime.ts`)

```typescript
interface RuntimeContext {
  readonly requestId: string;
  readonly traceId: string;
  readonly tenantId?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly priority: RequestPriority;
  readonly timeoutMs: number;
  readonly cancellationToken: AbortSignal;
  readonly logger: ContextLogger;
  readonly metrics: ContextMetrics;
}

type RuntimeState =
  | "init"      // Setting up
  | "loading"   // Loading models/binaries
  | "loaded"    // Ready for warmup
  | "warmup"    // Preparing for requests
  | "healthy"   // Ready to serve
  | "busy"      // At capacity
  | "recovering"// Recovering from error
  | "degraded"  // Partially functional
  | "stopping"  // Shutting down
  | "stopped"   // Shutdown complete
  | "failed";   // Unrecoverable error
```

### Provider Types (`packages/core/src/types/provider.ts`)

```typescript
interface TTSProvider {
  id: string;
  synthesize(text: string, options?: SynthesizeOptions): Promise<Buffer>;
  stream(text: string, options?: SynthesizeOptions): AsyncIterable<AudioChunk>;
  voices(): Promise<VoiceManifest[]>;
  supports(feature: string): boolean;
  health(): Promise<ProviderHealth>;
}
```

## Voice Management

### Namespace Format
```
piper/en_US-lessac-medium
kokoro/kokoro-v1.0
xtts/multilingual-v2
```

### Storage Structure
```
~/.modelforce/
├── voices/
│   ├── piper/
│   │   ├── en_US-lessac-medium.onnx
│   │   └── en_US-lessac-medium.onnx.json
│   ├── kokoro/
│   │   ├── kokoro-v1.0.bin
│   │   └── af_heart.bin
│   └── xtts/
│       └── multilingual-v2.pth
├── bin/
│   ├── piper.exe
│   ├── espeak-ng.dll
│   └── onnxruntime.dll
├── characters/
│   └── aynisa/
│       ├── manifest.json
│       ├── persona.md
│       └── avatar.png
└── config.json
```

## CLI Architecture

### Command Structure
```
modelforce
├── synthesize <text>        # Text-to-speech
├── pull <target>            # Download providers/voices
├── voices                   # List installed voices
├── benchmark                # Performance testing
├── doctor                   # Health checks
├── compare                  # Provider comparison
├── characters list          # List characters
├── characters info <id>     # Character details
├── characters validate <id> # Validate character
└── install character <id>   # Install character
```

### Provider Selection
All commands use `--provider` flag:
```bash
modelforce synthesize "Hello" --provider kokoro
modelforce benchmark --provider piper --iterations 50
modelforce pull voice/kokoro/af_heart
```

## Character System

### Character Manifest
```json
{
  "id": "aynisa",
  "displayName": "AyNisa",
  "voice": "piper/tr_TR-dfki-medium",
  "language": "tr-TR",
  "persona": {
    "traits": ["arkadaşça", "yardımcı"],
    "tone": "sıcak",
    "formality": "neutral",
    "systemPrompt": "Sen AyNisa'sın..."
  }
}
```

### Character Directory
```
~/.modelforce/characters/
└── aynisa/
    ├── manifest.json    # Character definition
    ├── persona.md       # Personality description
    └── avatar.png       # Character image
```

## Event System

### Events
```typescript
interface SynthesizeRequestEvent {
  type: "synthesize:request";
  text: string;
  options: SynthesizeOptions;
}

interface PluginLoadEvent {
  type: "plugin:load";
  pluginId: string;
}
```

### Health Monitoring
- `HealthMonitor`: Periodic checks per provider
- `CircuitBreaker`: Failure tracking with thresholds
- States: closed (healthy) → open (failing) → half-open (testing)

## Build System

### TypeScript Config
- **Target**: ES2022
- **Module**: NodeNext
- **Strict**: Enabled
- **Module Resolution**: Bundler (for monorepo)

### Turborepo
- Build caching enabled
- Package dependency graph
- Parallel execution

## Testing Strategy

### Mock Tests
- `MockBackendAdapter` - Returns synthetic audio
- No binary required
- Tests provider logic

### Integration Tests
- Requires real binary
- Downloads test voice
- Full synthesize pipeline

### Benchmark Tests
- Resource metrics (Memory, CPU, Load Time)
- Latency percentiles
- Realtime factor
- Throughput measurement

## Validation Results (Sprint 6)

### Provider Status
| Provider | Status | Interface | Issues |
|----------|--------|-----------|--------|
| Piper | ✅ Works | stdin/stdout | None |
| Kokoro | ⚠️ Partial | CLI args | Positional text, voice format |
| XTTS | ⚠️ Partial | HTTP POST | Server required, startup latency |

### Architecture Impact
- **BackendAdapter**: ✅ Unchanged - sufficient for all providers
- **Runtime**: ✅ Unchanged - no provider-specific code
- **CLI**: ⚠️ Added provider selector (works for all)

### Abstraction Leaks
- None detected - adapter pattern works

### Recommendations
- Keep adapter as-is
- Add voice downloads for Kokoro/XTTS
- Document installation methods per provider

## Sprint 9.5 - Dogfooding Results

### Working
- ✅ `modelforce install character/aynisa`
- ✅ `modelforce characters list`
- ✅ `modelforce characters info aynisa`
- ✅ `modelforce characters validate aynisa`
- ✅ `modeface synthesize "text" --mock`

### Bugs Found & Fixed
1. **Windows zip extraction** - `.tmp` extension not recognized
2. **Piper binary location** - Nested in subdirectory
3. **DLL dependencies** - Only copied exe, not DLLs
4. **Windows stdout** - `/dev/stdout` doesn't exist
5. **Voice ID mismatch** - Wrong Turkish voice ID

### Known Issues
- Piper binary crashes on Windows (0xC0000409)
- Requires `--mock` flag for testing on Windows

## Non Goals

ModelForce is NOT:

- an LLM framework
- an AI agent framework
- a chatbot
- a workflow engine
- a prompt manager
- a model trainer

ModelForce IS:

- runtime
- provider abstraction
- registry
- installer
- execution infrastructure

## Design Philosophy

Every abstraction in ModelForce must be justified by at least two concrete implementations.

If only one provider needs it,
it is provider-specific.

---

*Last updated: Sprint 9.5*
