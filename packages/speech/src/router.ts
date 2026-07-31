import { TTSProvider, RuntimePolicy, SynthesisRequest, StreamRequest } from "@modelforce/core";

export class Router {
  private policy: RuntimePolicy;
  private providers: Map<string, TTSProvider> = new Map();

  constructor(policy: RuntimePolicy) {
    this.policy = policy;
  }

  registerProvider(provider: TTSProvider): void {
    this.providers.set(provider.id, provider);
  }

  unregisterProvider(providerId: string): void {
    this.providers.delete(providerId);
  }

  selectProvider(_request: SynthesisRequest | StreamRequest): TTSProvider | null {
    const available = Array.from(this.providers.values());

    if (available.length === 0) {
      return null;
    }

    switch (this.policy) {
      case "offline-first":
        return this.selectOfflineFirst(available);
      case "quality-first":
        return this.selectQualityFirst(available);
      case "latency-first":
        return this.selectLatencyFirst(available);
      case "cpu-only":
        return this.selectCpuOnly(available);
      default:
        return available[0];
    }
  }

  private selectOfflineFirst(providers: TTSProvider[]): TTSProvider | null {
    const offline = providers.filter((p) => p.supports("offline"));
    if (offline.length > 0) {
      return offline[0];
    }
    return providers[0];
  }

  private selectQualityFirst(providers: TTSProvider[]): TTSProvider | null {
    return providers[0];
  }

  private selectLatencyFirst(providers: TTSProvider[]): TTSProvider | null {
    return providers[0];
  }

  private selectCpuOnly(providers: TTSProvider[]): TTSProvider | null {
    const cpuOnly = providers.filter((p) => p.supports("cpu-only"));
    if (cpuOnly.length > 0) {
      return cpuOnly[0];
    }
    return providers[0];
  }
}