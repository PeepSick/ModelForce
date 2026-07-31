# @modelforce/provider-piper

Piper TTS provider for ModelForce.

## Installation

```bash
pnpm add @modelforce/provider-piper
```

## Prerequisites

```bash
modelforce pull piper
modelforce pull voice/piper/en_US-lessac-medium
```

## Usage

```typescript
import { PiperProcessAdapter, PiperProvider } from "@modelforce/provider-piper";

const adapter = new PiperProcessAdapter({
  binPath: "~/.modelforce/piper",
  voicesDir: "~/.modelforce/voices/piper",
});

const provider = new PiperProvider({ adapter });

const audio = await provider.synthesize("Hello, world!", {
  voice: "piper/en_US-lessac-medium",
});
```

## Voices

Download voices:

```bash
modelforce pull voice/piper/en_US-lessac-medium
modelforce pull voice/piper/en_US-amy-medium
modelforce pull voice/piper/en_US-ryan-medium
```

## License

MIT
