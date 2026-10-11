import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getConfiguredProviders,
  hasAnyApiKey,
  setApiKey,
  setPreferredProvider,
  generatePromptsFromIdea,
  generatePromptFromImage,
} from "@/lib/api";

const okChat = (content: string) => ({
  ok: true,
  status: 200,
  json: async () => ({ choices: [{ message: { content } }] }),
});

const failChat = (status: number, message: string) => ({
  ok: false,
  status,
  json: async () => ({ error: { message } }),
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("provider key registry", () => {
  it("reports no providers when no keys are set", () => {
    expect(hasAnyApiKey()).toBe(false);
    expect(getConfiguredProviders()).toEqual([]);
  });

  it("detects any single configured provider", () => {
    setApiKey("cerebras", "ck-test");
    expect(hasAnyApiKey()).toBe(true);
    expect(getConfiguredProviders()).toEqual(["cerebras"]);
  });
});

describe("unified text engine", () => {
  it("throws a helpful error when no key is configured", async () => {
    await expect(generatePromptsFromIdea("cat", "photo", "fun", 2)).rejects.toThrow(
      /No API key found/
    );
  });

  it("works with only a non-default provider key (cerebras)", async () => {
    setApiKey("cerebras", "ck-test");
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okChat("1. alpha beta gamma delta epsilon\n2. zeta eta theta iota kappa")
    );
    vi.stubGlobal("fetch", fetchMock);
    const out = await generatePromptsFromIdea("cat", "photo", "fun", 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("api.cerebras.ai");
    expect(out).toHaveLength(2);
  });

  it("falls through to the next provider when the first fails", async () => {
    setApiKey("groq", "gq-test");
    setApiKey("cerebras", "ck-test");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(failChat(500, "groq exploded"))
      .mockResolvedValueOnce(failChat(500, "groq model gone"))
      .mockResolvedValueOnce(
        okChat("1. alpha beta gamma delta epsilon\n2. zeta eta theta iota kappa")
      );
    vi.stubGlobal("fetch", fetchMock);
    const out = await generatePromptsFromIdea("cat", "photo", "fun", 2);
    expect(out).toHaveLength(2);
    expect(fetchMock.mock.calls[0][0]).toContain("api.groq.com");
    expect(fetchMock.mock.calls[2][0]).toContain("api.cerebras.ai");
  });

  it("tries the preferred provider first", async () => {
    setApiKey("groq", "gq-test");
    setApiKey("cerebras", "ck-test");
    setPreferredProvider("cerebras");
    const fetchMock = vi.fn().mockResolvedValueOnce(
      okChat("1. alpha beta gamma delta epsilon\n2. zeta eta theta iota kappa")
    );
    vi.stubGlobal("fetch", fetchMock);
    await generatePromptsFromIdea("cat", "photo", "fun", 2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("api.cerebras.ai");
  });

  it("reports every tried provider when all fail", async () => {
    setApiKey("groq", "gq-test");
    const fetchMock = vi.fn().mockResolvedValue(failChat(401, "bad key"));
    vi.stubGlobal("fetch", fetchMock);
    await expect(generatePromptsFromIdea("cat", "photo", "fun", 2)).rejects.toThrow(
      /All configured providers failed.*Groq.*bad key/
    );
  });
});

describe("vision engine", () => {
  it("refuses when only text-only providers are configured", async () => {
    setApiKey("cerebras", "ck-test");
    await expect(generatePromptFromImage("aGVsbG8=", "photo", "short", false)).rejects.toThrow(
      /No image-capable API key/
    );
  });
});
