# ModelForce

One runtime. Multiple TTS providers.

Switch providers without changing your application.

## Quick Start (Development)

```bash
git clone https://github.com/modelforce/modelforce.git
cd modelforce
pnpm install
pnpm build
pnpm --filter @modelforce/cli start -- doctor
pnpm --filter @modelforce/cli start -- pull piper
pnpm --filter @modelforce/cli start -- pull voice/piper/en_US-lessac-medium
pnpm --filter @modelforce/cli start -- synthesize "Hello"
```

Done. You have `hello.wav`.

> **Note:** The CLI package has not been published to npm yet.

## Why ModelForce?

AI models change.

Your application shouldn't.

ModelForce provides a stable runtime over an evolving TTS ecosystem.

## Switch Providers

```bash
modelforce synthesize "Hello" --provider piper
modelforce synthesize "Hello" --provider kokoro
modelforce synthesize "Hello" --provider xtts
```

Same code. Different engine. One flag.

> `--mock` generates a short dial tone instead of synthesized speech. Useful for testing without a real provider.

## What is ModelForce?

ModelForce is an open-source infrastructure layer for self-hosted text-to-speech systems. It standardizes provider integration, installation, runtime execution, and developer tooling while allowing applications to switch between TTS engines with minimal changes.

ModelForce is NOT:

- a TTS engine
- an LLM framework
- an AI agent
- a chatbot

ModelForce IS:

- runtime
- provider abstraction
- registry
- installer
- execution infrastructure

## Architecture

```
CLI
 │
 ▼
Execution Engine
 │
 ▼
Provider Registry
 │
 ▼
Provider
 │
 ▼
Backend Adapter
 │
 ▼
Piper CLI / Kokoro CLI / XTTS HTTP
 │
 ▼
Audio (WAV)
```

## Providers

| Provider | Local | Streaming | Maturity |
|----------|-------|-----------|----------|
| Piper | ✅ | ⚠️ | Stable |
| Kokoro | ✅ | ⚠️ | Beta |
| XTTS | ⚠️ | ✅ | Beta |

## Quick Commands

```bash
modelforce doctor                    # System health check
modelforce pull piper               # Install Piper provider
modelforce pull voice/piper/en_US-lessac-medium  # Download voice
modelforce synthesize "Hello"       # Generate audio
modelforce voices                   # List installed voices
modelforce benchmark                # Performance test
modelforce compare                  # Compare providers
```

## For Developers

```bash
# Clone
git clone https://github.com/modelforce/modelforce.git
cd modelforce

# Install
pnpm install
pnpm build

# Test
pnpm test
```

## Documentation

- [Installation Guide](docs/installation.md)
- [Provider Setup](docs/providers.md)
- [Voice Management](docs/voices.md)
- [Architecture](Architecture.md)
- [Changelog](CHANGELOG.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Roadmap

- **v0.1 Alpha** - Provider Runtime
- **v0.2** - Character Packs
- **v0.3** - Speech Runtime
- **v1.0** - Stable API

## npm Installation (Coming Soon)

After the first public release, installation will be as simple as:

```bash
npm install -g @modelforce/cli
modelforce doctor
modelforce pull piper
modelforce synthesize "Hello"
```

## License

[MPL 2.0](LICENSE)
