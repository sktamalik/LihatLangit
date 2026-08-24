/**
 * Safe date formatting utilities — does NOT depend on Node.js ICU data.
 * Provides Indonesian locale formatting with manual fallback.
 */

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const MONTHS_LONG = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

/** Create Date from ISO string, handling BMKG's space-separated format */
function toDate(isoString: string): Date | null {
  const normalized = typeof isoString === "string" ? isoString.replace(" ", "T") : isoString;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format as "3 Juli 2026, 14:00" — Indonesian long date with time.
 * Falls back to raw string if date is invalid.
 */
export function formatTimestamp(isoString: string): string {
  const d = toDate(isoString);
  if (!d) return isoString;
  return (
    `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}, ` +
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  );
}

/**
 * Format just the time portion (HH:mm) from a date string.
 * Reliably handles BMKG "2026-07-03 16:00:00" format.
 */
export function formatTime(isoString: string): string {
  // Handle BMKG space-separated format directly
  if (isoString.includes(" ")) {
    const parts = isoString.split(" ");
    if (parts.length >= 2) {
      return parts[1].slice(0, 5); // "16:00"
    }
  }

  // Try Date parsing
  const d = toDate(isoString);
  if (d) {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // Fallback: extract HH:mm via regex
  const match = isoString.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : isoString;
}

/**
 * Format as "3 Jul 2026" — short Indonesian date.
 */
export function formatDateShort(isoString: string): string {
  const d = toDate(isoString);
  if (!d) return isoString;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format as "3 Juli 2026" — long Indonesian date.
 */
export function formatDateLong(isoString: string): string {
  const d = toDate(isoString);
  if (!d) return isoString;
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format as "3 Jul, 14:00" — short date with time.
 */
export function formatDateTimeShort(isoString: string): string {
  const d = toDate(isoString);
  if (!d) return isoString;
  return (
    `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}, ` +
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  );
}

/**
 * Get timezone abbreviation guess based on timezone string.
 */
export function getTimezoneAbbr(timezone?: string): string {
  if (!timezone) return "WIB";
  if (timezone.includes("Makassar")) return "WITA";
  if (timezone.includes("Jayapura")) return "WIT";
  return "WIB";
}

/**
 * Format BMKG analysis_date string without browser timezone interference.
 * BMKG sends dates like "2026-07-03T00:00:00" without timezone info.
 * Parsing via new Date() shifts it to browser local time — we avoid that.
 */
export function formatAnalysisDate(isoString: string, timezone?: string): string {
  // Parse manually — match BMKG "2026-07-03T00:00:00" format
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return isoString;

  const [, , m, d, h, min] = match;
  const monthIdx = parseInt(m, 10) - 1;
  const tzAbbr = getTimezoneAbbr(timezone);
  return parseInt(d, 10) + " " + MONTHS_SHORT[monthIdx] + ", " + h + ":" + min + " " + tzAbbr;
}


function getZonedDateTimeParts(
  date: Date,
  timezone?: string
): Record<"year" | "month" | "day" | "hour" | "minute", string> {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone ?? "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour") === "24" ? "00" : value("hour"),
    minute: value("minute"),
  };
}

/**
 * Format current time as "YYYY-MM-DDTHH:MM" in the given IANA timezone.
 */
export function formatLocalNow(timezone?: string): string {
  const { year, month, day, hour, minute } = getZonedDateTimeParts(
    new Date(),
    timezone
  );
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Get today's date string "YYYY-MM-DD" in the region's local timezone.
 */
export function getLocalTodayStr(timezone?: string): string {
  const { year, month, day } = getZonedDateTimeParts(new Date(), timezone);
  return `${year}-${month}-${day}`;
}

/**
 * Get tomorrow's date string "YYYY-MM-DD" in the region's local timezone.
 */
export function getLocalTomorrowStr(timezone?: string): string {
  const tomorrow = new Date(Date.now() + 86_400_000);
  const { year, month, day } = getZonedDateTimeParts(tomorrow, timezone);
  return `${year}-${month}-${day}`;
}

export { DAYS, MONTHS_LONG, MONTHS_SHORT };
