import { describe, it, expect } from "vitest";
import { searchRegions, findNearestRegion, getRegionByAdm4, toBmkgAdm4 } from "./regionSearch";

describe("searchRegions", () => {
  it("returns results for 'Kemayoran'", () => {
    const results = searchRegions("Kemayoran");
    expect(results.length).toBeGreaterThan(0);
    // Now data is uppercase from BPS/Kemendagri
    expect(results[0].district).toContain("KEMAYORAN");
  });

  it("returns empty array for empty query", () => {
    expect(searchRegions("")).toEqual([]);
    expect(searchRegions("   ")).toEqual([]);
  });

  it("returns empty array for gibberish", () => {
    expect(searchRegions("zzzzzzz")).toEqual([]);
  });

  it("prioritizes village exact match over district match", () => {
    const results = searchRegions("KEMAYORAN");
    // The village "KEMAYORAN" should rank higher than district-level match
    expect(results[0].village).toBe("KEMAYORAN");
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

  it("finds 'Mariso' in Makassar", () => {
    const results = searchRegions("Mariso");
    expect(results.length).toBeGreaterThan(0);
    const mariso = results.find((r) => r.district === "MARISO");
    expect(mariso).toBeDefined();
    expect(mariso!.city).toContain("MAKASSAR");
  });
});

describe("findNearestRegion", () => {
  it("returns null because dataset lacks coordinates", () => {
    // Dataset from emsifa doesn't include lat/lon coordinates
    const result = findNearestRegion(-6.162, 106.856);
    expect(result).toBeNull();
  });
});

describe("getRegionByAdm4", () => {
  it("returns region for valid adm4", () => {
    // Kemayoran village in Jakarta Pusat — updated code from new dataset
    const region = getRegionByAdm4("31.73.06.0007");
    expect(region).toBeDefined();
    expect(region!.village).toBe("KEMAYORAN");
    expect(region!.city).toContain("JAKARTA");
  });

  it("returns undefined for unknown adm4", () => {
    expect(getRegionByAdm4("99.99.99.9999")).toBeUndefined();
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
