import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { getWeatherForecast } from "@/lib/weatherService";
import type { WeatherForecast } from "@/types/weather";

const MAX_CODES = 40;
const CONCURRENCY = 5;
// Vercel Hobby kills functions at 10s — cap total wall-clock so partial results return
const BATCH_DEADLINE_MS = 9_000;

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

  const results: Record<string, WeatherForecast> = {};
  let rateLimited = false;
  const queue = [...codes];
  const deadline = Date.now() + BATCH_DEADLINE_MS;

  async function fetchOne(adm4: string): Promise<void> {
    const result = await getWeatherForecast(adm4, {
      allowNetwork: !rateLimited,
    });
    if (result.ok) results[adm4] = result.forecast;
    else rateLimited ||= result.rateLimited;
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

  const summary: Record<
    string,
    {
      region: Pick<WeatherForecast["region"], "city" | "district" | "village">;
      temperatureC: number | null;
      weatherDescription: string;
      humidityPct: number | null;
      windSpeedKmh: number | null;
      iconUrl?: string;
      analysisDateUtc: string | null;
      isStale: boolean;
    }
  > = {};

  for (const [adm4, forecast] of Object.entries(results)) {
    const point =
      forecast.nearestPoint ?? forecast.days[0]?.points[0] ?? undefined;
    summary[adm4] = {
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
  }

  const complete = Object.keys(summary).length >= codes.length;
  const cacheControl = complete
    ? "public, s-maxage=600, stale-while-revalidate=1800"
    : "public, s-maxage=30, stale-while-revalidate=120";

  return NextResponse.json(summary, {
    headers: { "Cache-Control": cacheControl },
  });
}
