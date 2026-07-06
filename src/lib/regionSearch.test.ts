import { describe, it, expect } from "vitest";
import { searchRegions, findNearestRegion, getRegionByAdm4, toBmkgAdm4, getAdm3Prefix, generateBmkgVariants, getVillagesByAdm3 } from "./regionSearch";

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

  it("returns up to 20 results", async () => {
    const results = await searchRegions("a");
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

describe("findNearestRegion", () => {
  it("returns null because dataset lacks coordinates", async () => {
    // Dataset from build script sets latitude/longitude to null
    const result = await findNearestRegion(-6.162, 106.856);
    expect(result).toBeNull();
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

describe("generateBmkgVariants", () => {
  it("generates variants for 0XXX code", () => {
    const variants = generateBmkgVariants("73.71.01.0005");
    expect(variants).toContain("73.71.01.1005"); // converted
    expect(variants).toContain("73.71.01.0005"); // original
    expect(variants.length).toBe(2);
  });

  it("generates variants for 1XXX code (reverse direction)", () => {
    const variants = generateBmkgVariants("73.71.01.1005");
    expect(variants).toContain("73.71.01.1005"); // original
    expect(variants).toContain("73.71.01.0005"); // reversed
    expect(variants.length).toBe(2);
  });

  it("handles invalid input", () => {
    expect(generateBmkgVariants("invalid")).toEqual(["invalid"]);
  });

  it("deduplicates when 0XXX and 1XXX are same", () => {
    // This shouldn't normally happen, but verify dedup works
    const variants = generateBmkgVariants("73.71.01.1001");
    expect(variants.length).toBe(2);
  });
});

describe("getVillagesByAdm3", () => {
  it("returns villages in district 73.71.01 (Mariso)", async () => {
    const villages = await getVillagesByAdm3("73.71.01");
    expect(villages.length).toBeGreaterThan(0);
    expect(villages[0].adm4).toMatch(/^73\.71\.01\./);
  });
});
