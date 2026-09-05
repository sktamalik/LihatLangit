import { describe, it, expect } from "vitest";
import { matchWarningForRegion } from "./useWarnings";
import type { WarningItem } from "@/app/api/warnings/route";
import type { Region } from "@/types/weather";

const mockWarnings: WarningItem[] = [
  {
    title: "Peringatan Dini Cuaca di Sumatera Barat",
    region: "Sumatera Barat",
    description: "Hujan lebat di Padang Selatan, Bungus Teluk Kabung, dan sekitarnya.",
    pubDate: "2026-09-05T08:00:00Z",
    link: "https://bmkg.go.id/1",
    category: "Nowcast",
  },
  {
    title: "Peringatan Dini Cuaca di DKI Jakarta",
    region: "DKI Jakarta",
    description: "Hujan disertai kilat/petir di Jakarta Selatan dan Jakarta Timur.",
    pubDate: "2026-09-05T08:00:00Z",
    link: "https://bmkg.go.id/2",
    category: "Nowcast",
  },
  {
    title: "Peringatan Dini Cuaca di Sulawesi Selatan",
    region: "Sulawesi Selatan",
    description: "Berpotensi hujan sedang-lebat di Kabupaten Gowa dan Maros.",
    pubDate: "2026-09-05T08:00:00Z",
    link: "https://bmkg.go.id/3",
    category: "Nowcast",
  },
];

describe("matchWarningForRegion", () => {
  it("returns null when warnings or region is empty", () => {
    expect(matchWarningForRegion([], null)).toBeNull();
    expect(matchWarningForRegion(mockWarnings, null)).toBeNull();
  });

  it("matches district level when district is in warning description", () => {
    const region: Region = {
      adm4: "13.71.01.1001",
      province: "Sumatera Barat",
      city: "Kota Padang",
      district: "Padang Selatan",
      village: "Teluk Bayur",
      latitude: -0.99,
      longitude: 100.37,
    };
    const result = matchWarningForRegion(mockWarnings, region);
    expect(result).not.toBeNull();
    expect(result?.matchLevel).toBe("district");
    expect(result?.warning.region).toBe("Sumatera Barat");
  });

  it("matches city level when city is in warning description", () => {
    const region: Region = {
      adm4: "73.06.01.1001",
      province: "Sulawesi Selatan",
      city: "Kabupaten Gowa",
      district: "Somba Opu",
      village: "Sungguminasa",
      latitude: -5.2,
      longitude: 119.45,
    };
    const result = matchWarningForRegion(mockWarnings, region);
    expect(result).not.toBeNull();
    expect(result?.matchLevel).toBe("city");
  });

  it("matches province level when only province matches", () => {
    const region: Region = {
      adm4: "73.71.01.1001",
      province: "Sulawesi Selatan",
      city: "Kota Makassar",
      district: "Ujung Pandang",
      village: "Sawerigading",
      latitude: -5.13,
      longitude: 119.41,
    };
    const result = matchWarningForRegion(mockWarnings, region);
    expect(result).not.toBeNull();
    expect(result?.matchLevel).toBe("province");
  });

  it("matches province aliases (e.g. Jakarta)", () => {
    const region: Region = {
      adm4: "31.74.01.1001",
      province: "Jakarta",
      city: "Kota Jakarta Pusat",
      district: "Gambir",
      village: "Gambir",
      latitude: -6.17,
      longitude: 106.82,
    };
    const result = matchWarningForRegion(mockWarnings, region);
    expect(result).not.toBeNull();
    expect(result?.warning.region).toBe("DKI Jakarta");
  });

  it("returns null when no warning matches the region", () => {
    const region: Region = {
      adm4: "51.71.01.1001",
      province: "Bali",
      city: "Kota Denpasar",
      district: "Denpasar Selatan",
      village: "Sanur",
      latitude: -8.67,
      longitude: 115.25,
    };
    expect(matchWarningForRegion(mockWarnings, region)).toBeNull();
  });
});
