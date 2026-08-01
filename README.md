# ModelForce

[![CI](https://github.com/PeepSick/ModelForce/actions/workflows/ci.yml/badge.svg)](https://github.com/PeepSick/ModelForce/actions)
[![Test Piper Provider](https://github.com/PeepSick/ModelForce/actions/workflows/test-piper.yml/badge.svg)](https://github.com/PeepSick/ModelForce/actions/workflows/test-piper.yml)

**One API for local and remote text-to-speech providers.**

Switch between Piper, Kokoro, XTTS (and more) without changing your application.

## Why?

Every TTS engine has its own API, installation, configuration, and voice management.

ModelForce provides one interface for all of them.

| Without ModelForce | With ModelForce |
|--------------------|-----------------|
| Each provider has different API | One unified API |
| Separate auth for each | Single auth system |
| Separate configs | One config format |
| Vendor lock-in | Provider abstraction |
| Manual installation | One command install |

## 30-Second Example

```typescript
import { ModelForceClient } from "@modelforce/sdk";

const mf = new ModelForceClient();

await mf.synthesize({
    provider: "piper",
    text: "Hello world"
});
```

Done. You have audio.

## Works With

| Provider | Type | Status |
|----------|------|--------|
| Piper | Local | ✅ |
| Kokoro | Local | ✅ |
| XTTS | Remote | ✅ |

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

## Architecture

```
Your App → SDK → Provider → Backend → Audio
```

## Quick Commands

```bash
modelforce doctor                     # Health check
modelforce pull piper                 # Install provider
modelforce synthesize "Hello"         # Generate audio
modelforce quick "Hello"              # Quick synthesis
modelforce play "Hello"               # Synthesize and play
```

## Why Not...

- **LangChain** - Focuses on LLM chains, not TTS runtime
- **LiteLLM** - Focuses on LLM routing, not TTS providers
- **OpenAI SDK** - Single provider, not multi-provider abstraction

ModelForce focuses specifically on runtime abstraction for text-to-speech providers.

## Packages

| Package | Description |
|---------|-------------|
| `@modelforce/sdk` | Simple API for text-to-speech |
| `@modelforce/server` | REST API server |
| `@modelforce/web` | React Web UI |
| `@modelforce/cli` | Command-line interface |
| `@modelforce/provider-piper` | Piper TTS provider |
| `@modelforce/provider-kokoro` | Kokoro TTS provider |
| `@modelforce/provider-xtts` | XTTS TTS provider |

## Known Issues

See [Known Limitations.md](Known%20Limitations.md)

## For Developers

```bash
pnpm test
```

## License

[MPL 2.0](LICENSE)
