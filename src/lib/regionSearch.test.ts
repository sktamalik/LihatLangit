import { describe, it, expect } from "vitest";
import { searchRegions, findNearestRegion, getRegionByAdm4 } from "./regionSearch";

describe("searchRegions", () => {
  it("returns results for 'Kemayoran'", () => {
    const results = searchRegions("Kemayoran");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].district).toContain("Kemayoran");
  });

  it("returns empty array for empty query", () => {
    expect(searchRegions("")).toEqual([]);
    expect(searchRegions("   ")).toEqual([]);
  });

  it("returns empty array for gibberish", () => {
    expect(searchRegions("zzzzzzz")).toEqual([]);
  });

  it("prioritizes village exact match over district match", () => {
    const results = searchRegions("Kemayoran");
    // The village "Kemayoran" should rank higher than district match
    expect(results[0].village).toBe("Kemayoran");
  });

  it("returns up to 20 results", () => {
    const results = searchRegions("a");
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it("includes adm4 in results", () => {
    const results = searchRegions("Tebet");
    for (const r of results) {
      expect(r.adm4).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{4}$/);
    }
  });

  it("is case insensitive", () => {
    const lower = searchRegions("kemayoran");
    const upper = searchRegions("KEMAYORAN");
    expect(lower.length).toBe(upper.length);
    expect(lower[0].adm4).toBe(upper[0].adm4);
  });
});

describe("findNearestRegion", () => {
  it("returns nearest region for Jakarta coordinates", () => {
    const result = findNearestRegion(-6.162, 106.856);
    expect(result).not.toBeNull();
    expect(result!.adm4).toBe("31.71.03.1001"); // Kemayoran
  });

  it("returns nearest for Makassar coordinates", () => {
    const result = findNearestRegion(-5.15, 119.407);
    expect(result).not.toBeNull();
    expect(result!.city).toContain("Makassar");
  });
});

describe("getRegionByAdm4", () => {
  it("returns region for valid adm4", () => {
    const region = getRegionByAdm4("31.71.03.1001");
    expect(region).toBeDefined();
    expect(region!.village).toBe("Kemayoran");
  });

  it("returns undefined for unknown adm4", () => {
    expect(getRegionByAdm4("99.99.99.9999")).toBeUndefined();
  });
});
