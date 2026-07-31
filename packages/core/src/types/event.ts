// Event Types
export type EventType =
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
  | "system.info";

// Event Severity
export type EventSeverity = "info" | "warning" | "error" | "critical";

// Event Payload
export interface Event {
  type: EventType;
  timestamp: Date;
  source: string;
  data: Record<string, unknown>;
  severity: EventSeverity;
}

// Event Handler
export type EventHandler = (event: Event) => void;

// Event Emitter Interface
export interface EventEmitter {
  emit(event: Event): void;
  on(type: EventType, handler: EventHandler): void;
  off(type: EventType, handler: EventHandler): void;
}

// Event Filter
export type EventFilter = (event: Event) => boolean;
