# ADR-0003: Registry System

## Status

Accepted

## Context

ModelForce needs to:
1. Discover available providers
2. Download provider binaries/models
3. Manage installed artifacts
4. Support multiple sources (local, remote, npm)

## Decision

Implement a Registry with multiple sources:

```typescript
interface RegistryProvider {
  id: string;
  type: "local" | "remote" | "npm";
  
  listProviders(): Promise<ProviderMeta[]>;
  getProvider(id: string): Promise<ProviderMeta>;
  downloadProvider(id: string): Promise<Buffer>;
}
```

Discovery order:
1. Explicit paths (user-specified)
2. Plugin directories
3. node_modules
4. Registry sources

## Consequences

### Positive
- Flexible provider sourcing
- Easy to add new registries
- Supports offline usage (local registry)
- npm-compatible for community providers

### Negative
- Multiple sources can cause confusion
- Version management complexity

## Alternatives Considered

1. **Single Registry**: Rejected - limits flexibility
2. **npm Only**: Rejected - not all providers are npm packages
3. **No Registry**: Rejected - requires manual installation

## Implementation Details

### LocalRegistry
- File-based storage
- Used for development/testing

### RemoteRegistry
- HTTP-based fetching
- Supports mirrors

### ProviderDiscovery
- Cascading search across sources
- Caching for performance

---

*Decision made: Sprint 3*
