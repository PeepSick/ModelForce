# RFC-0002: Event System

**Status:** Frozen
**Created:** 2026-07-31

---

## Purpose

Defines the event system for ModelForce. All state changes emit events. System is observable.

---

## Event Types

`	ypescript
type EventType =
  // Provider events
  | "provider.pulled"
  | "provider.installed"
  | "provider.activated"
  | "provider.deactivated"
  | "provider.uninstalled"
  | "provider.failed"
  | "provider.health.changed"

  // Artifact events
  | "artifact.pulled"
  | "artifact.installed"
  | "artifact.uninstalled"
  | "artifact.corrupted"

  // Runtime events
  | "runtime.started"
  | "runtime.stopped"
  | "runtime.health.changed"

  // Queue events
  | "queue.request.added"
  | "queue.request.processing"
  | "queue.request.completed"
  | "queue.request.failed"
  | "queue.request.cancelled"
  | "queue.overflow"

  // Character events
  | "character.activated"
  | "character.deactivated"
  | "character.interaction"

  // System events
  | "system.error"
  | "system.warning"
  | "system.info"
`

---

## Event Payload

`	ypescript
interface Event {
  type: EventType;
  timestamp: Date;
  source: string;
  data: Record<string, unknown>;
  severity: "info" | "warning" | "error" | "critical";
}
`

---

## Event Emitter Interface

`	ypescript
interface EventEmitter {
  emit(event: Event): void;
  on(type: EventType, handler: (event: Event) => void): void;
  off(type: EventType, handler: (event: Event) => void): void;
}
`

---

## Event Logger

`	ypescript
class EventLogger implements EventEmitter {
  private handlers: Map<EventType, Function[]>;
  private history: Event[];

  emit(event: Event): void;
  on(type: EventType, handler: Function): void;
  off(type: EventType, handler: Function): void;
  getHistory(type?: EventType, limit?: number): Event[];
  clear(): void;
}
`

---

## Event Bus

`	ypescript
class EventBus implements EventEmitter {
  private logger: EventLogger;
  private subscribers: Map<EventType, Function[]>;

  emit(event: Event): void;
  on(type: EventType, handler: Function): void;
  off(type: EventType, handler: Function): void;

  // Wildcard subscription
  onAny(handler: (event: Event) => void): void;

  // Filtered subscription
  where(filter: (event: Event) => boolean, handler: Function): void;
}
`

---

## Event Examples

### Provider Installed

`	ypescript
{
  type: "provider.installed",
  timestamp: new Date("2026-07-31T16:30:00Z"),
  source: "installer",
  data: {
    providerId: "piper",
    version: "1.2.0",
    checksum: "abc123...",
  },
  severity: "info"
}
`

### Queue Overflow

`	ypescript
{
  type: "queue.overflow",
  timestamp: new Date("2026-07-31T16:35:00Z"),
  source: "runtime.core",
  data: {
    queueSize: 1000,
    maxQueueSize: 1000,
    rejectedRequests: 5,
  },
  severity: "warning"
}
`

### Provider Failed

`	ypescript
{
  type: "provider.failed",
  timestamp: new Date("2026-07-31T16:40:00Z"),
  source: "runtime.speech",
  data: {
    providerId: "azure",
    error: "API key expired",
    requestId: "req-123",
  },
  severity: "error"
}
`

---

## Usage

### CLI: View Events

`ash
modelforce events --last 20

Output:
  [2026-07-31 16:30:00] provider.installed    piper v1.2.0
  [2026-07-31 16:30:01] artifact.installed    model/piper/tr_TR_female-medium
  [2026-07-31 16:30:02] runtime.started       Speech Runtime
  [2026-07-31 16:30:15] queue.request.added   synthesize-001 (priority: realtime)
  [2026-07-31 16:30:15] queue.request.processing synthesize-001
  [2026-07-31 16:30:16] queue.request.completed synthesize-001 (latency: 234ms)
`

### CLI: Stream Events

`ash
modelforce events --stream

Output:
  Streaming events... (Ctrl+C to stop)
  [2026-07-31 16:45:00] queue.request.added   synthesize-002
  [2026-07-31 16:45:00] queue.request.processing synthesize-002
  ...
`

---

## Integration

Events can be forwarded to external systems:

`yaml
# ~/.modelforce/config.yaml
events:
  forward:
    - type: webhook
      url: https://monitoring.company.com/events
      filter: ["provider.failed", "queue.overflow"]
    - type: file
      path: /var/log/modelforce/events.jsonl
`

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-31 | Initial frozen version |
