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

/**
 * Get current date string (YYYY-MM-DD) in the region's local timezone.
 * Indonesia only has 3 timezones: WIB (+7), WITA (+8), WIT (+9).
 */
function getLocalTodayStr(timezone?: string): string {
  const now = new Date();
  let offsetMinutes = 7 * 60; // default WIB

  if (timezone) {
    const tzMap: Record<string, number> = {
      "Asia/Jakarta": 7 * 60,
      "Asia/Makassar": 8 * 60,
      "Asia/Jayapura": 9 * 60,
    };
    offsetMinutes = tzMap[timezone] ?? 7 * 60;
  }

  const localMs = now.getTime() + offsetMinutes * 60 * 1000;
  const localDate = new Date(localMs);

  const y = localDate.getUTCFullYear();
  const m = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(localDate.getUTCDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

/** Indonesian day label for a date string — timezone-aware */
function dayLabel(dateStr: string, timezone?: string): string {
  const todayStr = getLocalTodayStr(timezone);
  const tomorrowStr = getLocalTomorrowStr(timezone);

  if (dateStr === todayStr) return "Hari ini";
  if (dateStr === tomorrowStr) return "Besok";

  const date = new Date(dateStr + "T00:00:00");
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()] ?? dateStr;
}

/** Get tomorrow's date string in the region's local timezone */
function getLocalTomorrowStr(timezone?: string): string {
  const now = new Date();
  let offsetMinutes = 7 * 60;

  if (timezone) {
    const tzMap: Record<string, number> = {
      "Asia/Jakarta": 7 * 60,
      "Asia/Makassar": 8 * 60,
      "Asia/Jayapura": 9 * 60,
    };
    offsetMinutes = tzMap[timezone] ?? 7 * 60;
  }

  const localMs = now.getTime() + offsetMinutes * 60 * 1000 + 86400000;
  const tomorrowDate = new Date(localMs);

  const y = tomorrowDate.getUTCFullYear();
  const m = String(tomorrowDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(tomorrowDate.getUTCDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
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
  
  // BMKG provides authoritative coordinates — prefer them over local dataset
  const bmkgLat = safeNumber(lokasi.latitude ?? lokasi.lat);
  const bmkgLon = safeNumber(lokasi.longitude ?? lokasi.lon);
  
  const region: Region = {
    adm4: safeString(lokasi.adm4) || (fallbackRegion?.adm4 ?? ""),
    province: safeString(lokasi.provinsi) || (fallbackRegion?.province ?? ""),
    city: safeString(lokasi.kotkab || lokasi.kota) || (fallbackRegion?.city ?? ""),
    district: safeString(lokasi.kecamatan) || (fallbackRegion?.district ?? ""),
    village: safeString(lokasi.desa) || (fallbackRegion?.village ?? ""),
    // Prefer BMKG's authoritative coordinates
    latitude: bmkgLat ?? fallbackRegion?.latitude,
    longitude: bmkgLon ?? fallbackRegion?.longitude,
    timezone: lokasi.timezone || fallbackRegion?.timezone,
  };

  // ── Analysis date ──
  // Try top-level first, then extract from first available slot
  const analysisDateUtc = raw.analysis_date
    ?? raw.data?.[0]?.cuaca?.[0]?.[0]?.analysis_date
    ?? null;

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
      label: dayLabel(date, region.timezone),
      points,
    });
    count++;
  }

  // ── Find nearest forecast point ──
  const nearestPoint = getNearestForecastPoint(allPoints, region.timezone);

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
 *
 * IMPORTANT: point.localDateTime is in LOCAL time (e.g., WITA+8),
 * so we must compare against local current time, NOT UTC.
 * Without timezone we fall back to server local time.
 */
export function getNearestForecastPoint(
  points: WeatherPoint[],
  timezone?: string
): WeatherPoint | null {
  if (points.length === 0) return null;

  const localNow = formatLocalNow(timezone);

  // Find first point whose localDateTime is >= local current time
  for (const point of points) {
    if (point.localDateTime >= localNow) {
      return point;
    }
  }

  // All points are in the past — return the last available
  return points[points.length - 1];
}

/**
 * Get current time formatted as YYYY-MM-DDTHH:MM in a given IANA timezone.
 * Indonesia only has 3 timezones: WIB (+7), WITA (+8), WIT (+9).
 */
function formatLocalNow(timezone?: string): string {
  const now = new Date();
  let offsetMinutes = 7 * 60; // default WIB

  if (timezone) {
    const tzMap: Record<string, number> = {
      "Asia/Jakarta": 7 * 60,
      "Asia/Makassar": 8 * 60,
      "Asia/Jayapura": 9 * 60,
    };
    offsetMinutes = tzMap[timezone] ?? 7 * 60;
  }

  const localMs = now.getTime() + offsetMinutes * 60 * 1000;
  const localDate = new Date(localMs);

  const y = localDate.getUTCFullYear();
  const m = String(localDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(localDate.getUTCDate()).padStart(2, "0");
  const h = String(localDate.getUTCHours()).padStart(2, "0");
  const min = String(localDate.getUTCMinutes()).padStart(2, "0");

  return `${y}-${m}-${d}T${h}:${min}`;
}
