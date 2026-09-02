/**
 * GET /api/gempa
 *
 * Fetches latest earthquake data from BMKG.
 * Data source: https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json
 *
 * Returns the most recent earthquakes with magnitude, location, depth, and tsunami potential.
 */

import { NextResponse } from "next/server";

const BMKG_GEMPA_URL = "https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit — gempa data updates frequently

interface GempaEntry {
  /** BMKG returns UPPERCASE keys (Tanggal, Magnitude, Kedalaman, Wilayah, Potensi) */
  [key: string]: string;
  // Keep typed accessors for our own use; BMKG fields accessed via bracket notation in components
  tanggal: string;
  jam: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  potensi: string;
  coordinates: string;
  lintang: string;
  bujur: string;
}

let cache: { data: GempaEntry[]; fetchedAt: number } | null = null;

export async function GET() {
  // Return cached if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ gempa: cache.data }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  try {
    const res = await fetch(BMKG_GEMPA_URL, {
      next: { revalidate: 300 },
      headers: { "User-Agent": "LihatLangit/2.0 (weather-dashboard; +https://lihatlangit.vercel.app)" },
    });

    if (!res.ok) {
      // Return stale cache if available
      if (cache) {
        return NextResponse.json({ gempa: cache.data, fromCache: true });
      }
      return NextResponse.json(
        { error: { code: "BMKG_UNAVAILABLE", message: "Data gempa tidak tersedia." } },
        { status: 502 }
      );
    }

    const raw: { Infogempa?: { gempa?: GempaEntry[] } } = await res.json();
    const gempa = raw?.Infogempa?.gempa ?? [];

    cache = { data: gempa, fetchedAt: Date.now() };

    return NextResponse.json({ gempa }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    if (cache) {
      return NextResponse.json({ gempa: cache.data, fromCache: true });
    }
    return NextResponse.json(
      { error: { code: "FETCH_ERROR", message: "Gagal mengambil data gempa." } },
      { status: 502 }
    );
  }
}
