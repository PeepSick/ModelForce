# RFC-0000: Core Principles

**Status:** Frozen
**Created:** 2026-07-31

---

## Purpose

This document defines the non-negotiable architectural principles of the ModelForce platform. Every RFC, every implementation, every design decision must conform to these principles.

---

## Principles

### 1. Provider Agnostic

No provider is special. All providers implement the same contract. Adding a new provider never changes the runtime, the CLI, or the consumer API.

LeoVoice Neural, when it exists, is just another provider.

### 2. Registry Driven

All metadata lives in registries. Runtime never hardcodes knowledge about providers, voices, characters, or models.

Registry is an interface, not a URL. It can be remote, local, or mirror.

### 3. Offline First

System works without internet. Registry can be local filesystem. Air-gapped deployments are first-class citizens.

### 4. Character First

Character is the top-level abstraction. Voice is one capability of a character. A character speaks, writes, reasons, uses tools, and has a visual identity.

### 5. Engine Independent

Voice identities are independent of TTS engines. The same voice works across Piper, Azure, ElevenLabs, or any future engine.

### 6. Backward Compatible

New versions never break existing packs. Migration paths are explicit and versioned. Old packs continue to work.

### 7. Event Driven

All state changes emit events. System is observable. Providers, artifacts, runtime, and characters emit events for monitoring, debugging, and integration.

### 8. Plugin Based

Everything is a plugin. TTS, Vision, OCR, Tools — same lifecycle, same interface, same management.

### 9. Generic Runtime

One runtime core. Domain-specific runtimes (Speech, Vision, Reason, Tool) layer on top. The core handles queue, scheduling, concurrency, caching, and events.

### 10. Telemetry Optional

Enterprise can disable all telemetry. No data leaves the system unless explicitly configured.

---

## Hierarchy

`
Character Runtime (orchestrates everything)
    |
Speech Runtime | LLM Runtime | Tool Runtime | Vision Runtime
    |
ModelForce Runtime Core (queue, scheduler, concurrency, events)
    |
Provider Plugins (Piper, Azure, etc.)
    |
Artifact Registry (models, voices, characters, prompts, skills, avatars)
    |
Registry Interface (remote, local, mirror)
`

---

## Constraints

- All types defined in @modelforce/core are the source of truth.
- Runtime must never import provider-specific code directly.
- CLI must never contain business logic — it delegates to packages.
- Every pack (voice, character) must carry version, apiVersion, and minRuntime.
- Checksums are mandatory for all downloadable artifacts.

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial frozen version |
