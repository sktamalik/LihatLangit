/**
 * Normalize raw BMKG API response into our internal WeatherForecast model.
 */

import type {
  BmkgRawResponse,
  WeatherForecast,
  WeatherPoint,
  WeatherDay,
  Region,
} from "@/types/weather";

/** Safe number conversion: returns null for null/undefined/non-numeric */
function safeNumber(val: string | number | null | undefined): number | null {
  if (val == null) return null;
  const n = typeof val === "string" ? parseFloat(val) : val;
  return isNaN(n) ? null : n;
}

/** Safe string: returns empty string for null/undefined/number */
function safeString(val: string | number | null | undefined): string {
  if (val == null) return "";
  if (typeof val === "number") return String(val);
  return val;
}

/** Indonesian-ish day label for a date string */
function dayLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const tomorrowStr = new Date(
    today.getTime() + 86400000
  ).toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Hari ini";
  if (dateStr === tomorrowStr) return "Besok";

  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()] ?? dateStr;
}

/**
 * Normalize raw BMKG response into WeatherForecast.
 *
 * @param raw - Raw response from BMKG API
 * @param fallbackRegion - Optional region data from local dataset
 * @returns Normalized forecast or null if data is unusable
 */
export function normalizeBmkgForecast(
  raw: BmkgRawResponse,
  fallbackRegion?: Region
): WeatherForecast | null {
  const now = new Date().toISOString();

  // ── Build region from BMKG lokasi, fallback to local dataset ──
  const lokasi = raw.lokasi ?? {};
  const region: Region = fallbackRegion ?? {
    adm4: "",
    province: safeString(lokasi.provinsi),
    city: safeString(lokasi.kota),
    district: safeString(lokasi.kecamatan),
    village: safeString(lokasi.desa),
    latitude: safeNumber(lokasi.latitude) ?? undefined,
    longitude: safeNumber(lokasi.longitude) ?? undefined,
    timezone: lokasi.timezone,
  };

  // ── Analysis date ──
  const analysisDateUtc = raw.analysis_date ?? null;

  // ── No data array ──
  if (!raw.data || !Array.isArray(raw.data) || raw.data.length === 0) {
    return {
      source: "BMKG",
      region,
      analysisDateUtc,
      fetchedAt: now,
      fromCache: false,
      isStale: false,
      nearestPoint: null,
      days: [],
    };
  }

  // ── Flatten all forecast points ──
  const allPoints: WeatherPoint[] = [];

  for (const dayData of raw.data) {
    if (!dayData.cuaca || !Array.isArray(dayData.cuaca)) continue;

    for (const slot of dayData.cuaca) {
      const localDateTime = safeString(slot.local_datetime);
      if (!localDateTime) continue;

      const point: WeatherPoint = {
        utcDateTime: safeString(slot.utc_datetime),
        localDateTime,
        temperatureC: safeNumber(slot.t),
        humidityPct: safeNumber(slot.hu),
        weatherDescription: safeString(slot.weather_desc),
        weatherDescriptionEn: safeString(slot.weather_desc_en) || undefined,
        windSpeedKmh: safeNumber(slot.ws),
        windDirection: safeString(slot.wd) || null,
        cloudCoverPct: safeNumber(slot.tcc),
        visibilityText: safeString(slot.vs_text) || null,
        iconUrl: slot.image || undefined,
      };

      allPoints.push(point);
    }
  }

  // ── Sort by local_datetime ──
  allPoints.sort(
    (a, b) => a.localDateTime.localeCompare(b.localDateTime)
  );

  // ── Group by date ──
  const dayMap = new Map<string, WeatherPoint[]>();

  for (const point of allPoints) {
    const dateKey = point.localDateTime.slice(0, 10); // "2026-07-03"
    const existing = dayMap.get(dateKey) ?? [];
    existing.push(point);
    dayMap.set(dateKey, existing);
  }

  // ── Build days array (max 3) ──
  const days: WeatherDay[] = [];
  let count = 0;
  for (const [date, points] of dayMap) {
    if (count >= 3) break;
    days.push({
      date,
      label: dayLabel(date),
      points,
    });
    count++;
  }

  // ── Find nearest forecast point ──
  const nearestPoint = getNearestForecastPoint(allPoints);

  return {
    source: "BMKG",
    region,
    analysisDateUtc,
    fetchedAt: now,
    fromCache: false,
    isStale: false,
    nearestPoint,
    days,
  };
}

/**
 * Find the forecast point nearest to current local time.
 * Returns the first slot at or after now; if all are past, returns the last.
 */
export function getNearestForecastPoint(
  points: WeatherPoint[]
): WeatherPoint | null {
  if (points.length === 0) return null;

  const now = new Date().toISOString();

  // Find first point whose localDateTime is >= now
  for (const point of points) {
    if (point.localDateTime >= now.slice(0, 16)) {
      return point;
    }
  }

  // All points are in the past — return the last available
  return points[points.length - 1];
}
