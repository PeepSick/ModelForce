# ModelForce

[![CI](https://github.com/PeepSick/ModelForce/actions/workflows/ci.yml/badge.svg)](https://github.com/PeepSick/ModelForce/actions)
[![Test Piper Provider](https://github.com/PeepSick/ModelForce/actions/workflows/test-piper.yml/badge.svg)](https://github.com/PeepSick/ModelForce/actions/workflows/test-piper.yml)

One runtime. Multiple TTS providers.

Switch providers without changing your application.

## Getting Started

```bash
git clone https://github.com/PeepSick/ModelForce.git
cd ModelForce
pnpm install
pnpm build
pnpm --filter @modelforce/cli start -- doctor
pnpm --filter @modelforce/cli start -- pull piper
pnpm --filter @modelforce/cli start -- pull voice/piper/en_US-lessac-medium
pnpm --filter @modelforce/cli start -- synthesize "Hello"
```

Done. You have `hello.wav`.

## Why ModelForce?

| Without ModelForce | With ModelForce |
|--------------------|-----------------|
| Each provider has different API | One unified API |
| Separate auth for each | Single auth system |
| Separate configs | One config format |
| Vendor lock-in | Provider abstraction |
| Manual installation | One command install |

```
Your App
    ↓
ModelForce SDK
    ↓
Provider (piper / kokoro / xtts)
    ↓
Audio (WAV)
```

Change the provider. Your code stays the same.

## Switch Providers

```bash
modelforce synthesize "Hello" --provider piper
modelforce synthesize "Hello" --provider kokoro
modelforce synthesize "Hello" --provider xtts
```

> `--mock` generates a dial tone instead of speech. Useful for testing without a real provider.

## Web UI & Server

```bash
# REST API server
pnpm dev:server

# React web interface
pnpm dev:web
```

## Architecture

```
Client (CLI / SDK / Web UI)
         ↓
    ModelForce Gateway
         ↓
    Provider Registry
         ↓
    Provider Adapter
         ↓
    Backend (Piper CLI / Kokoro CLI / XTTS HTTP)
         ↓
      Audio (WAV)
```

## Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Piper | ✅ Stable | Local, offline |
| Kokoro | ✅ Stable | Local, offline |
| XTTS | ⚠️ Beta | HTTP backend |

## Health Matrix

| Platform | Status |
|----------|--------|
| Linux | ✅ All providers work |
| Windows | ✅ Piper works |
| Windows Build 26200 | ⚠️ [Known issue](https://github.com/OHF-Voice/piper1-gpl/issues/260) |

## Quick Commands

```bash
modelforce doctor                     # System health check
modelforce pull piper                 # Install Piper provider
modelforce pull voice/piper/en_US-lessac-medium  # Download voice
modelforce synthesize "Hello"         # Generate audio
modelforce voices                     # List installed voices
modelforce quick "Hello"              # Quick synthesis
modelforce play "Hello"               # Synthesize and play
```

## Packages

| Package | Description |
|---------|-------------|
| `@modelforce/core` | Core types and interfaces |
| `@modelforce/sdk` | Simple API for text-to-speech |
| `@modelforce/server` | REST API server |
| `@modelforce/web` | React Web UI |
| `@modelforce/cli` | Command-line interface |
| `@modelforce/runtime` | Execution engine |
| `@modelforce/provider-piper` | Piper TTS provider |

## For Developers

```bash
git clone https://github.com/PeepSick/ModelForce.git
cd ModelForce
pnpm install
pnpm build
pnpm test
```

## Roadmap

- **v0.1 Alpha** - Provider Runtime
- **v0.2** - Character Packs
- **v0.3** - Speech Runtime
- **v1.0** - Stable API

## Documentation

- [Architecture](Architecture.md)
- [Changelog](CHANGELOG.md)
- [Known Limitations](Known%20Limitations.md)

## License

[MPL 2.0](LICENSE)
