# Changelog

All notable changes to ModelForce Voice Ecosystem will be documented in this file.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [0.1.0-alpha] - 2025-07-31

### Architecture Validation (Sprint 6)

**Validated:**
- Piper: ✅ Works (stdin/stdout)
- Kokoro: ⚠️ Partial (positional args, different voice format)
- XTTS: ⚠️ Partial (HTTP backend required)

**Findings:**
- BackendAdapter interface sufficient for all providers
- No Runtime changes needed
- CLI provider selector works
- No abstraction leaks detected

**Documentation:**
- Added Validation Report.md
- Updated Architecture.md with provider details
- Added Known Limitations.md

### Added

#### Core
- `RuntimeContext` - Execution state with metrics, logs, timing
- `RuntimeState` - Runtime lifecycle states (idle, loading, synthesize, stream, error, shutdown)
- `Runtime` - Synthesize/stream interface with timeout and abort support
- `RuntimeConfig` - Provider selection, voice, quality, streaming, timeout settings
- `TTSProvider` - Provider interface with synthesize, voices, supports, health
- `SynthesizeOptions` - Voice, speed, pitch, sample rate, format, speaker WAV
- `AudioChunk` - Streaming audio chunks with metadata
- `VoiceManifest` - Voice metadata (ID, language, gender, locale)
- `PluginContext` - Plugin registration API

#### Event System
- `EventBus` interface for plugin communication
- `InMemoryEventBus` - Typed event system with subscribe/publish
- Event types: SynthesizeRequest/Complete/Error, PluginLoad/Unload, HealthCheck

#### Health Monitoring
- `HealthMonitor` - Periodic health checks with configurable intervals
- `CircuitBreaker` - Failure tracking with configurable thresholds
- `CircuitBreakerRegistry` - Per-provider circuit breakers

#### Plugin System
- `PluginManager` - Full lifecycle (register, init, start, stop, unload)
- `PluginLoader` - Dynamic import with validation
- Plugin states: registered → initialized → started → stopped → unloaded

#### Provider Architecture
- **Provider-Piper**: ONNX-based TTS with ProcessAdapter
  - `PiperProcessAdapter` - Real binary invocation (stdin/stdout)
  - `MockBackendAdapter` - Testing without binary
  - `PiperProvider` - TTSProvider implementation
- **Provider-Kokoro**: Neural TTS with CLI
  - `KokoroProcessAdapter` - Positional text argument, `--output` flag
  - `KokoroProvider` - TTSProvider implementation
- **Provider-XTTS**: Multilingual TTS with HTTP/Process
  - `XttsHttpAdapter` - HTTP POST to `/api/tts`
  - `XttsProcessAdapter` - CLI fallback
  - `XttsProvider` - TTSProvider implementation

#### CLI Commands
- `modelforce synthesize <text>` - Text-to-speech with `--provider` flag
- `modelforce pull <target>` - Download providers and voices
- `modelforce voices` - List installed voices
- `modelforce benchmark` - Performance testing with resource metrics
- `modelforce doctor` - Health checks with tree-style output
- `modelforce compare` - Compare providers side-by-side

#### Benchmark Features
- Latency percentiles (P50, P95, P99)
- Realtime factor calculation
- Throughput (chars/sec)
- Memory peak/average tracking
- CPU time measurement
- Model size detection
- Cold/warm start timing
- Resource metrics per iteration

#### Voice Management
- Voice namespace format: `provider/voice-id`
- Per-provider voice directories
- Voice cache with TTL
- Parallel synthesis with concurrency control

#### Configuration
- `ConfigManager` - Load/save modelforce.json
- `ProviderId` type: `piper | kokoro | xtts`
- `getProviderConfig()` - Get paths for provider
- `isProviderInstalled()` - Check installation status

#### TypeScript
- ES2022 target
- NodeNext module resolution
- Strict mode enabled
- Full type exports

### Architecture
- Monorepo with 11 packages
- Adapter pattern: Provider → BackendAdapter → ProcessAdapter/MockAdapter
- Provider packages are independent and optional
- No premature abstractions (no ProviderFactory)
- Build from clean clone passes
- Mock tests pass without binaries

### Known Limitations
- Kokoro/XTTS require external installation (Python, binaries)
- Real integration tests blocked until binaries downloadable
- Voice downloads limited to Piper (HuggingFace)
- No GUI yet (CLI only)

---

## Roadmap

See [Roadmap.md](Roadmap.md) for planned features.

## Architecture

See [Architecture.md](Architecture.md) for system design.

## Known Limitations

See [Known Limitations.md](Known%20Limitations.md) for constraints and workarounds.
