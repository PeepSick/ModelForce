// ModelForce Core Errors

export class ModelForceError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ModelForceError";
    this.code = code;
    this.details = details;
  }
}

export class ProviderNotFoundError extends ModelForceError {
  constructor(providerId: string) {
    super("PROVIDER_NOT_FOUND", "Provider not found: " + providerId, { providerId });
    this.name = "ProviderNotFoundError";
  }
}

export class ProviderNotInstalledError extends ModelForceError {
  constructor(providerId: string) {
    super("PROVIDER_NOT_INSTALLED", "Provider not installed: " + providerId, { providerId });
    this.name = "ProviderNotInstalledError";
  }
}

export class ProviderLoadError extends ModelForceError {
  constructor(providerId: string, reason: string) {
    super("PROVIDER_LOAD_FAILED", "Failed to load provider " + providerId + ": " + reason, { providerId, reason });
    this.name = "ProviderLoadError";
  }
}

export class ProviderTimeoutError extends ModelForceError {
  constructor(providerId: string, timeout: number) {
    super("PROVIDER_TIMEOUT", "Provider " + providerId + " timed out after " + timeout + "ms", { providerId, timeout });
    this.name = "ProviderTimeoutError";
  }
}

export class ChecksumMismatchError extends ModelForceError {
  constructor(artifactId: string, expected: string, actual: string) {
    super("CHECKSUM_MISMATCH", "Checksum mismatch for " + artifactId, { artifactId, expected, actual });
    this.name = "ChecksumMismatchError";
  }
}

export class RuntimeVersionMismatchError extends ModelForceError {
  constructor(required: string, current: string) {
    super("RUNTIME_VERSION_MISMATCH", "Runtime version " + current + " does not meet requirement " + required, { required, current });
    this.name = "RuntimeVersionMismatchError";
  }
}

export class QueueOverflowError extends ModelForceError {
  constructor(maxSize: number) {
    super("QUEUE_OVERFLOW", "Queue overflow: max size " + maxSize + " reached", { maxSize });
    this.name = "QueueOverflowError";
  }
}