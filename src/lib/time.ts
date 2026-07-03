/**
 * Time formatting utilities.
 */

/**
 * Format an ISO timestamp for display in Indonesian locale.
 * Example: "3 Juli 2026, 14:00 WIB"
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
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
 * Format just the time portion (HH:mm) from an ISO string.
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
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
