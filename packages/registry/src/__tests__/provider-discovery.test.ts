import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProviderDiscovery } from "../discovery/provider-discovery.js";
import type { RegistryProvider } from "../registry-provider.js";

describe("ProviderDiscovery", () => {
  let discovery: ProviderDiscovery;
  let mockRegistry: RegistryProvider;

  beforeEach(() => {
    mockRegistry = {
      id: "test-registry",
      name: "Test Registry",
      type: "npm",
      url: "https://registry.test.com",
      enabled: true,
      getProvider: vi.fn(),
      listProviders: vi.fn(),
    };

    discovery = new ProviderDiscovery({
      registries: [mockRegistry],
    });
  });

  it("should discover provider from registry", async () => {
    const mockMeta = {
      id: "test",
      name: "Test Provider",
      version: "1.0.0",
      description: "Test",
      author: "Test",
      license: "MIT",
      repository: "https://github.com/test/test",
      keywords: [],
      engines: { node: ">=18" },
      provider: {
        id: "test",
        name: "Test Provider",
        version: "1.0.0",
        capabilities: ["synthesize"],
      },
    };

    vi.mocked(mockRegistry.getProvider).mockResolvedValue(mockMeta);

    const result = await discovery.discover("test");

    expect(result).not.toBeNull();
    expect(result?.provider.id).toBe("test");
    expect(result?.source.type).toBe("registry");
  });

  it("should return null if provider not found", async () => {
    vi.mocked(mockRegistry.getProvider).mockRejectedValue(new Error("Not found"));

    const result = await discovery.discover("nonexistent");

    expect(result).toBeNull();
  });

  it("should cache results", async () => {
    const mockMeta = {
      id: "test",
      name: "Test Provider",
      version: "1.0.0",
      description: "Test",
      author: "Test",
      license: "MIT",
      repository: "https://github.com/test/test",
      keywords: [],
      engines: { node: ">=18" },
      provider: {
        id: "test",
        name: "Test Provider",
        version: "1.0.0",
        capabilities: ["synthesize"],
      },
    };

    vi.mocked(mockRegistry.getProvider).mockResolvedValue(mockMeta);

    await discovery.discover("test");
    await discovery.discover("test");

    expect(mockRegistry.getProvider).toHaveBeenCalledOnce();
  });

  it("should clear cache", async () => {
    const mockMeta = {
      id: "test",
      name: "Test Provider",
      version: "1.0.0",
      description: "Test",
      author: "Test",
      license: "MIT",
      repository: "https://github.com/test/test",
      keywords: [],
      engines: { node: ">=18" },
      provider: {
        id: "test",
        name: "Test Provider",
        version: "1.0.0",
        capabilities: ["synthesize"],
      },
    };

    vi.mocked(mockRegistry.getProvider).mockResolvedValue(mockMeta);

    await discovery.discover("test");
    discovery.clearCache();
    await discovery.discover("test");

    expect(mockRegistry.getProvider).toHaveBeenCalledTimes(2);
  });

  it("should discover all providers from registry", async () => {
    const mockProviders = [
      {
        id: "test1",
        name: "Test 1",
        version: "1.0.0",
        description: "Test 1",
        author: "Test",
        license: "MIT",
        repository: "https://github.com/test/test1",
        keywords: [],
        engines: { node: ">=18" },
        provider: {
          id: "test1",
          name: "Test 1",
          version: "1.0.0",
          capabilities: ["synthesize"],
        },
      },
      {
        id: "test2",
        name: "Test 2",
        version: "1.0.0",
        description: "Test 2",
        author: "Test",
        license: "MIT",
        repository: "https://github.com/test/test2",
        keywords: [],
        engines: { node: ">=18" },
        provider: {
          id: "test2",
          name: "Test 2",
          version: "1.0.0",
          capabilities: ["synthesize"],
        },
      },
    ];

    vi.mocked(mockRegistry.listProviders).mockResolvedValue(mockProviders);

    const results = await discovery.discoverAll();

    expect(results).toHaveLength(2);
    expect(results[0].provider.id).toBe("test1");
    expect(results[1].provider.id).toBe("test2");
  });
});
