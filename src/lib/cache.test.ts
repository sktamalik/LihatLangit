import { describe, it, expect, beforeEach } from "vitest";
import { setCache, getCache, clearCache } from "./cache";

interface TestPayload {
  value: number;
}

describe("cache", () => {
  beforeEach(() => {
    clearCache();
  });

  it("returns miss for unknown key", () => {
    const result = getCache("nonexistent");
    expect(result.status).toBe("miss");
  });

  it("returns fresh for cached item within TTL", () => {
    setCache<TestPayload>("test-key", { value: 42 }, 3600_000);
    const result = getCache<TestPayload>("test-key");
    expect(result.status).toBe("fresh");
    if (result.status === "fresh") {
      expect(result.payload.value).toBe(42);
    }
  });

  it("returns stale for expired but within stale window", () => {
    setCache<TestPayload>("test-key", { value: 99 }, 0, 3600_000); // TTL=0, stale=1h
    const result = getCache<TestPayload>("test-key");
    expect(result.status).toBe("stale");
    if (result.status === "stale") {
      expect(result.payload.value).toBe(99);
    }
  });

  it("returns miss after stale window", () => {
    setCache<TestPayload>("test-key", { value: 1 }, 0, 0); // TTL=0, stale=0
    const result = getCache<TestPayload>("test-key");
    expect(result.status).toBe("miss");
  });

  it("sets and gets multiple keys independently", () => {
    setCache<TestPayload>("a", { value: 1 });
    setCache<TestPayload>("b", { value: 2 });
    const a = getCache<TestPayload>("a");
    const b = getCache<TestPayload>("b");
    expect(a.status).toBe("fresh");
    expect(b.status).toBe("fresh");
    if (a.status === "fresh") expect(a.payload.value).toBe(1);
    if (b.status === "fresh") expect(b.payload.value).toBe(2);
  });

  it("provides fetchedAt timestamp", () => {
    setCache<TestPayload>("test-key", { value: 7 });
    const result = getCache<TestPayload>("test-key");
    expect(result.status).not.toBe("miss");
    if (result.status !== "miss" && result.status !== "stale") {
      expect(result.fetchedAt).toBeDefined();
      expect(new Date(result.fetchedAt).toISOString()).toBe(result.fetchedAt);
    }
  });
});
