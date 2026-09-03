import { describe, it, expect } from "vitest";
import { searchRegions, getRegionByAdm4, toBmkgAdm4, getAdm3Prefix, findNearestWithData, findBmkgFallback } from "./regionSearch";

describe("searchRegions", () => {
  it("returns results for 'Kemayoran'", async () => {
    const results = await searchRegions("Kemayoran");
    expect(results.length).toBeGreaterThan(0);
    // Now data is uppercase from BPS/Kemendagri
    expect(results[0].district).toContain("KEMAYORAN");
  });

  it("finds regions with multi-word query (village + city)", async () => {
    // Search for a well-known area: "Mariso Makassar"
    const results = await searchRegions("Mariso Makassar");
    expect(results.length).toBeGreaterThan(0);
    // The top result should be in Makassar with district Mariso
    const match = results.find(
      (r) => r.city.includes("MAKASSAR") && r.district === "MARISO"
    );
    expect(match).toBeDefined();
  });

  it("returns empty array for empty query", async () => {
    expect(await searchRegions("")).toEqual([]);
    expect(await searchRegions("   ")).toEqual([]);
  });

  it("returns empty array for gibberish", async () => {
    expect(await searchRegions("zzzzzzz")).toEqual([]);
  });

  it("prioritizes village exact match over district match", async () => {
    const results = await searchRegions("KEMAYORAN");
    // The village "KEMAYORAN" should rank higher than district-level match
    expect(results[0].village).toBe("KEMAYORAN");
  });

  it("caps results at 20", async () => {
    // Short query must not trigger the min-2-char guard; use common 2-char query
    const results = await searchRegions("Ci");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it("includes adm4 in results", async () => {
    const results = await searchRegions("Tebet");
    for (const r of results) {
      expect(r.adm4).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    }
  });

  it("is case insensitive", async () => {
    const lower = await searchRegions("kemayoran");
    const upper = await searchRegions("KEMAYORAN");
    expect(lower.length).toBe(upper.length);
    expect(lower[0].adm4).toBe(upper[0].adm4);
  });

  it("finds 'Mariso' in Makassar", async () => {
    const results = await searchRegions("Mariso");
    expect(results.length).toBeGreaterThan(0);
    const mariso = results.find((r) => r.district === "MARISO");
    expect(mariso).toBeDefined();
    expect(mariso!.city).toContain("MAKASSAR");
  });
});

describe("getRegionByAdm4", () => {
  it("returns region for valid adm4", async () => {
    // Kemayoran village in Jakarta Pusat — updated code from new dataset
    const region = await getRegionByAdm4("31.73.06.0007");
    expect(region).toBeDefined();
    expect(region!.village).toBe("KEMAYORAN");
    expect(region!.city).toContain("JAKARTA");
  });

  it("returns undefined for unknown adm4", async () => {
    expect(await getRegionByAdm4("99.99.99.9999")).toBeUndefined();
  });
});

describe("toBmkgAdm4", () => {
  it("converts 0XXX format to 1XXX format", () => {
    expect(toBmkgAdm4("31.73.06.0007")).toBe("31.73.06.1007");
    expect(toBmkgAdm4("73.71.01.0005")).toBe("73.71.01.1005");
    expect(toBmkgAdm4("11.01.01.0001")).toBe("11.01.01.1001");
  });

  it("leaves 1XXX+ format unchanged", () => {
    expect(toBmkgAdm4("31.71.03.1001")).toBe("31.71.03.1001");
    expect(toBmkgAdm4("31.71.03.1002")).toBe("31.71.03.1002");
  });

  it("handles invalid input gracefully", () => {
    expect(toBmkgAdm4("invalid")).toBe("invalid");
    expect(toBmkgAdm4("")).toBe("");
  });
});

describe("getAdm3Prefix", () => {
  it("extracts adm3 from full adm4", () => {
    expect(getAdm3Prefix("73.71.01.0005")).toBe("73.71.01");
    expect(getAdm3Prefix("31.73.06.1007")).toBe("31.73.06");
  });

  it("returns full string for invalid input", () => {
    expect(getAdm3Prefix("invalid")).toBe("invalid");
  });
});

describe("findNearestWithData", () => {
  it("returns the same-district code (tier 0) for a covered adm3", async () => {
    // 32.01.01 (Bogor) has known coverage → its own code, tier 0
    const candidates = await findNearestWithData("32.01.01", 3);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates[0]).toEqual({ code: "32.01.01.1001", tier: 0 });
  });

  it("returns known-working codes even for adm3 with zero coverage (Aceh)", async () => {
    // 11.01.01 (Simeulue, Aceh) — province 11 has NO coverage → nearest province (Sumut)
    const candidates = await findNearestWithData("11.01.01", 3);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => c.code.startsWith("12."))).toBe(true); // Sumatera Utara
    expect(candidates.every((c) => c.tier === 3)).toBe(true);
  });

  it("respects the limit", async () => {
    const candidates = await findNearestWithData("11.01.01", 1);
    expect(candidates.length).toBe(1);
  });

  it("returns empty for unknown adm3", async () => {
    expect(await findNearestWithData("99.99.99")).toEqual([]);
  });
});

describe("findBmkgFallback", () => {
  it("starts with the exact code variants (0XXX→1XXX conversion)", async () => {
    // 73.71.01.0005 → BMKG variant 73.71.01.1005 should be among the first
    const candidates = await findBmkgFallback("73.71.01.0005");
    expect(candidates[0]).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    expect(candidates).toContain("73.71.01.1005");
  });

  it("always includes a guaranteed provincial capital (zero-coverage province, Bali 51)", async () => {
    const candidates = await findBmkgFallback("51.01.01.1001");
    // Denpasar capital (51.71.x) must be in the list as the safety net
    expect(candidates.some((c) => c.startsWith("51.71."))).toBe(true);
  });

  it("contains coverage codes from the same province", async () => {
    // 18.71.04.0005 (Lampung) — province 18 has coverage entries
    const candidates = await findBmkgFallback("18.71.04.0005");
    expect(candidates.some((c) => c.startsWith("18."))).toBe(true);
  });

  it("returns only valid adm4 codes and respects the cap", async () => {
    const candidates = await findBmkgFallback("62.05.01.0001", 20);
    expect(candidates.length).toBeLessThanOrEqual(20);
    for (const c of candidates) {
      expect(c).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    }
  });
});
