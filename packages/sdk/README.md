# @modelforce/sdk

Simple API for text-to-speech synthesis.

## Installation

```bash
npm install @modelforce/sdk
```

## Quick Start

```typescript
import { ModelForceClient } from "@modelforce/sdk";

const client = new ModelForceClient({ provider: "piper" });

// Simple synthesis
const result = await client.synthesize("Hello world");
await writeFile("output.wav", result.audio);
```

## Usage

### Basic Synthesis

```typescript
import { ModelForceClient } from "@modelforce/sdk";

const client = new ModelForceClient();

// Synthesize with default settings
const result = await client.synthesize("Merhaba dünya");
console.log(`Generated ${result.size} bytes in ${result.latency}ms`);

// Save to file
import { writeFile } from "fs/promises";
await writeFile("output.wav", result.audio);
```

### Custom Options

```typescript
const result = await client.synthesize("Hello", {
  voice: "piper/en_US-lessac-medium",
  provider: "piper",
  speed: 1.2,
  format: "wav",
  sampleRate: 22050,
});
```

### Stream Synthesis

```typescript
for await (const chunk of client.stream("Hello world")) {
  console.log(`Chunk ${chunk.sequence}: ${chunk.data.length} bytes`);
  // Process chunk...
}
```

### List Voices

```typescript
const voices = await client.voices();
for (const voice of voices) {
  console.log(`${voice.id} - ${voice.name} (${voice.language})`);
}
```

### Health Check

```typescript
const health = await client.health();
console.log(`Status: ${health.status}, Latency: ${health.latency}ms`);
```

### Provider Info

```typescript
const info = await client.getProviderInfo("piper");
console.log(`${info.name} v${info.version}`);
console.log(`Capabilities: ${info.capabilities.join(", ")}`);
```

### Event Listening

```typescript
client.on("synthesize:start", (event) => {
  console.log(`Starting synthesis: "${event.text}" with ${event.provider}`);
});

client.on("synthesize:complete", (event) => {
  console.log(`Completed in ${event.latency}ms (${event.size} bytes)`);
});

client.on("synthesize:error", (event) => {
  console.error(`Error: ${event.error}`);
});
```

### Mock Client (Testing)

```typescript
const mockClient = client.createMock();
const result = await mockClient.synthesize("Test");
// Returns synthetic audio without real provider
```

## Configuration

```typescript
const client = new ModelForceClient({
  provider: "piper",      // Default provider
  voice: "en_US-lessac-medium",  // Default voice
  timeout: 30000,         // Timeout in ms
  debug: false,           // Enable debug logging
});

// Update configuration
client.configure({ provider: "kokoro" });
```

## Types

```typescript
import type {
  ProviderId,
  SynthesizeOptions,
  SynthesizeResult,
  VoiceInfo,
  HealthStatus,
  StreamChunk,
  SDKConfig,
  SDKEvent,
} from "@modelforce/sdk";
```

## Providers

| Provider | Status | Interface |
|----------|--------|-----------|
| Piper | ✅ Stable | stdin/stdout |
| Kokoro | ⚠️ Partial | CLI args |
| XTTS | ⚠️ Partial | HTTP POST |

## License

MPL-2.0
