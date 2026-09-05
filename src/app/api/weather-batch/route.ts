import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { getWeatherForecast } from "@/lib/weatherService";
import type { WeatherForecast } from "@/types/weather";

const MAX_CODES = 40;
const CONCURRENCY = 3;
const BATCH_DEADLINE_MS = 9_000;
const BATCH_CACHE_TTL_MS = 15 * 60 * 1000; // 15 menit

type CitySummary = {
  region: Pick<WeatherForecast["region"], "city" | "district" | "village">;
  temperatureC: number | null;
  weatherDescription: string;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  iconUrl?: string;
  analysisDateUtc: string | null;
  isStale: boolean;
};

// In-memory cache server-side agar batch tidak membebani BMKG di setiap request pengguna
let globalBatchCache: Record<string, CitySummary> = {};
let lastBatchTimestamp = 0;

export async function GET(request: NextRequest) {
  const codesParam = new URL(request.url).searchParams.get("adm4");

  if (!codesParam) {
    return NextResponse.json(
      { error: "Parameter adm4 wajib diisi (comma-separated)." },
      { status: 400 }
    );
  }

  const codes = codesParam
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

  if (codes.length === 0) {
    return NextResponse.json(
      { error: "Minimal satu kode adm4." },
      { status: 400 }
    );
  }
  if (codes.length > MAX_CODES) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_CODES} kode adm4.` },
      { status: 400 }
    );
  }

  const invalidCode = codes.find((code) => !isValidAdm4(code));
  if (invalidCode) {
    return NextResponse.json(
      { error: `Kode adm4 tidak valid: ${invalidCode}` },
      { status: 400 }
    );
  }

  const now = Date.now();
  const isCacheFresh = now - lastBatchTimestamp < BATCH_CACHE_TTL_MS;
  const missingFromCache = codes.filter((c) => !globalBatchCache[c]);

  // Jika semua kode ada di in-memory cache dan masih fresh, kembalikan instan (1ms)
  if (isCacheFresh && missingFromCache.length === 0) {
    const cachedResult: Record<string, CitySummary> = {};
    for (const c of codes) {
      if (globalBatchCache[c]) cachedResult[c] = globalBatchCache[c];
    }
    return NextResponse.json(cachedResult, {
      headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800" },
    });
  }

  const results: Record<string, WeatherForecast> = {};
  let rateLimited = false;
  // Prioritaskan mengambil kode yang belum ada di cache sama sekali
  const queue = [...missingFromCache, ...codes.filter((c) => !missingFromCache.includes(c))];
  const deadline = Date.now() + BATCH_DEADLINE_MS;

  async function fetchOne(adm4: string): Promise<void> {
    const result = await getWeatherForecast(adm4, {
      allowNetwork: !rateLimited,
    });
    if (result.ok) {
      results[adm4] = result.forecast;
    } else {
      rateLimited ||= result.rateLimited;
    }
    // Stagger kecil agar BMKG tidak terkena burst bersamaan
    await new Promise((r) => setTimeout(r, 60));
  }

  async function worker(): Promise<void> {
    while (queue.length > 0 && Date.now() < deadline) {
      const adm4 = queue.shift();
      if (!adm4) break;
      await fetchOne(adm4);
    }
  }

  await Promise.allSettled(
    Array.from({ length: Math.min(CONCURRENCY, codes.length) }, worker)
  );

  const summary: Record<string, CitySummary> = {};

  for (const [adm4, forecast] of Object.entries(results)) {
    const point =
      forecast.nearestPoint ?? forecast.days[0]?.points[0] ?? undefined;
    const item: CitySummary = {
      region: {
        city: forecast.region.city,
        district: forecast.region.district,
        village: forecast.region.village,
      },
      temperatureC: point?.temperatureC ?? null,
      weatherDescription: point?.weatherDescription ?? "—",
      humidityPct: point?.humidityPct ?? null,
      windSpeedKmh: point?.windSpeedKmh ?? null,
      iconUrl: point?.iconUrl,
      analysisDateUtc: forecast.analysisDateUtc,
      isStale: forecast.isStale,
    };
    summary[adm4] = item;
    globalBatchCache[adm4] = item; // Simpan ke global memory cache
  }

  // Isi kota yang belum sempat ter-fetch atau rate-limited dengan data cache sebelumnya jika ada
  for (const code of codes) {
    if (!summary[code] && globalBatchCache[code]) {
      summary[code] = {
        ...globalBatchCache[code],
        isStale: true,
      };
    }
  }

  if (Object.keys(summary).length > 0) {
    lastBatchTimestamp = Date.now();
  }

  const complete = Object.keys(summary).length >= codes.length;
  const cacheControl = complete
    ? "public, s-maxage=600, stale-while-revalidate=1800"
    : "public, s-maxage=60, stale-while-revalidate=300";

  return NextResponse.json(summary, {
    headers: { "Cache-Control": cacheControl },
  });
}
