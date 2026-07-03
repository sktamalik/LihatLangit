/**
 * Normalize raw BMKG API response into our internal WeatherForecast model.
 *
 * The BMKG API returns cuaca as an array of arrays. Each day's data contains
 * multiple sub-arrays, each with several 3-hour slots. We flatten all slots,
 * sort by local_datetime, group by date, and build the forecast model.
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

/**
 * Normalize local_datetime from BMKG.
 * BMKG returns space-separated format: "2026-07-03 16:00:00"
 * We need ISO-like format for comparison: "2026-07-03T16:00:00"
 */
function normalizeLocalDateTime(dt: string): string {
  return dt.replace(" ", "T");
}

/** Extract date portion (YYYY-MM-DD) from local_datetime */
function extractDate(localDateTime: string): string {
  return localDateTime.slice(0, 10);
}

/** Indonesian day label for a date string */
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
    city: safeString(lokasi.kotkab || lokasi.kota),
    district: safeString(lokasi.kecamatan),
    village: safeString(lokasi.desa),
    latitude: safeNumber(lokasi.latitude ?? lokasi.lat) ?? undefined,
    longitude: safeNumber(lokasi.longitude ?? lokasi.lon) ?? undefined,
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
  // BMKG returns cuaca as Array<Array<slot>> — flatten the nested arrays
  const allPoints: WeatherPoint[] = [];

  for (const dayData of raw.data) {
    if (!dayData.cuaca || !Array.isArray(dayData.cuaca)) continue;

    for (const slotArray of dayData.cuaca) {
      // slotArray is itself an array of slot objects
      if (!Array.isArray(slotArray)) continue;

      for (const slot of slotArray) {
        if (!slot || typeof slot !== "object") continue;

        // BMKG local_datetime uses space separator: "2026-07-03 16:00:00"
        const rawLocalDateTime = safeString(slot.local_datetime);
        if (!rawLocalDateTime) continue;

        const localDateTime = normalizeLocalDateTime(rawLocalDateTime);

        const point: WeatherPoint = {
          utcDateTime: safeString(slot.utc_datetime || slot.datetime),
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
  }

  // ── If no valid points found ──
  if (allPoints.length === 0) {
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

  // ── Sort by local_datetime ──
  allPoints.sort(
    (a, b) => a.localDateTime.localeCompare(b.localDateTime)
  );

  // ── Group by date ──
  const dayMap = new Map<string, WeatherPoint[]>();

  for (const point of allPoints) {
    const dateKey = extractDate(point.localDateTime);
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
