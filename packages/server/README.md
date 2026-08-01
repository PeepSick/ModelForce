# @modelforce/server

REST API server for text-to-speech synthesis.

## Installation

```bash
npm install @modelforce/server
```

## Quick Start

```typescript
import { ModelForceServer } from "@modelforce/server";

const server = new ModelForceServer({ port: 3000 });
await server.start();
```

## CLI Usage

```bash
# Start with defaults
modelforce-serve

# Custom port
modelforce-serve -p 8080

# Enable API key auth
modelforce-serve --api-key my-secret-key

# Custom CORS origin
modelforce-serve --cors http://localhost:5173
```

## API Endpoints

### Health Check

```
GET /api/health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600,
    "version": "0.1.0",
    "providers": [...]
  }
}
```

### Synthesize

```
POST /api/synthesize
```

Request:
```json
{
  "text": "Hello world",
  "provider": "piper",
  "voice": "en_US-lessac-medium",
  "format": "wav",
  "speed": 1.0
}
```

Response:
```json
{
  "success": true,
  "data": {
    "audioUrl": "/audio/uuid.wav",
    "format": "wav",
    "size": 24298,
    "latency": 150,
    "provider": "piper",
    "voice": "en_US-lessac-medium"
  }
}
```

### List Voices

```
GET /api/voices?provider=piper
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "en_US-lessac-medium",
      "name": "English (US) - Lessac Medium",
      "language": "en-US",
      "gender": "male",
      "provider": "piper"
    }
  ]
}
```

### List Providers

```
GET /api/providers
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "piper",
      "name": "Piper",
      "version": "1.0.0",
      "status": "healthy",
      "capabilities": ["offline", "cpu-only"]
    }
  ]
}
```

## Authentication

Enable API key authentication:

```bash
modelforce-serve --api-key my-secret-key
```

Then include the key in requests:

```bash
curl -H "X-API-Key: my-secret-key" http://localhost:3000/api/health
```

## Configuration

```typescript
const server = new ModelForceServer({
  port: 3000,
  host: "0.0.0.0",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  rateLimit: {
    max: 100,
    timeWindow: 60000,
  },
  auth: {
    enabled: true,
    apiKey: "my-secret-key",
  },
  storage: {
    audioDir: "./audio",
    maxFileSize: 10 * 1024 * 1024,
  },
});
```

## Docker

```dockerfile
FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/cli.js"]
```

## License

MPL-2.0
