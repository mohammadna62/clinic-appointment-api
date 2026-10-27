
import { describe, it, expect, vi, afterEach } from "vitest";

afterEach(() => {
  vi.doUnmock("../src/config/env.js");
  vi.doUnmock("../src/providers/ai/mock-ai.provider.js");
  vi.doUnmock("../src/providers/ai/openai-ai.provider.js");
  vi.resetModules();
});

describe("AI provider factory", () => {
  it("should create MockAIProvider when AI_PROVIDER is mock", async () => {
    const MockAIProvider = vi.fn();

    vi.doMock("../src/config/env.js", () => ({
      default: { AI_PROVIDER: "mock" },
    }));

    vi.doMock("../src/providers/ai/mock-ai.provider.js", () => ({
      default: MockAIProvider,
    }));

    vi.doMock("../src/providers/ai/openai-ai.provider.js", () => ({
      default: vi.fn(),
    }));

    const { default: provider } = await import(
      "../src/providers/ai/ai-provider.js"
    );

    expect(MockAIProvider).toHaveBeenCalledOnce();
    expect(provider).toBeInstanceOf(MockAIProvider);
  });

  it("should create OpenAIProvider when AI_PROVIDER is openai", async () => {
    const OpenAIProvider = vi.fn();

    vi.doMock("../src/config/env.js", () => ({
      default: { AI_PROVIDER: "openai" },
    }));

    vi.doMock("../src/providers/ai/mock-ai.provider.js", () => ({
      default: vi.fn(),
    }));

    vi.doMock("../src/providers/ai/openai-ai.provider.js", () => ({
      default: OpenAIProvider,
    }));

    const { default: provider } = await import(
      "../src/providers/ai/ai-provider.js"
    );

    expect(OpenAIProvider).toHaveBeenCalledOnce();
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });

  it("should throw an error for an unsupported provider", async () => {
    vi.doMock("../src/config/env.js", () => ({
      default: { AI_PROVIDER: "unsupported" },
    }));

    vi.doMock("../src/providers/ai/mock-ai.provider.js", () => ({
      default: vi.fn(),
    }));

    vi.doMock("../src/providers/ai/openai-ai.provider.js", () => ({
      default: vi.fn(),
    }));

    await expect(
      import("../src/providers/ai/ai-provider.js"),
    ).rejects.toThrow("Unsupported AI provider: unsupported");
  });
});
