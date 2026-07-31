import { TTSProvider } from "@modelforce/core";

export class FailoverManager {
  private failoverChain: Map<string, string[]> = new Map();

  setFailoverChain(providerId: string, chain: string[]): void {
    this.failoverChain.set(providerId, chain);
  }

  getFallback(failedProviderId: string, providers: Map<string, TTSProvider>): TTSProvider | null {
    const chain = this.failoverChain.get(failedProviderId);
    if (chain) {
      for (const id of chain) {
        const provider = providers.get(id);
        if (provider) {
          return provider;
        }
      }
    }

    for (const [id, provider] of providers) {
      if (id !== failedProviderId) {
        return provider;
      }
    }

    return null;
  }
}