/**
 * Time formatting utilities.
 * Handles BMKG's space-separated date format: "2026-07-03 16:00:00"
 */

/** Normalize BMKG space-separated datetime to ISO format for reliable JS Date parsing */
function normalizeDate(isoString: string): string {
  return isoString.replace(" ", "T");
}

/**
 * Format an ISO timestamp for display in Indonesian locale.
 * Example: "3 Juli 2026, 14:00"
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(normalizeDate(isoString));
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
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

  // Try ISO format
  try {
    const date = new Date(normalizeDate(isoString));
    if (isNaN(date.getTime())) return isoString.slice(11, 16) || isoString;
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    // Fallback: extract HH:mm directly
    const match = isoString.match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : isoString;
  }
}

/**
 * Get timezone abbreviation guess based on timezone string.
 */
export function getTimezoneAbbr(timezone?: string): string {
  if (!timezone) return "WIB";
  if (timezone.includes("Makassar") || timezone.includes("+0800")) return "WITA";
  if (timezone.includes("Jayapura") || timezone.includes("+0900")) return "WIT";
  return "WIB";
}
