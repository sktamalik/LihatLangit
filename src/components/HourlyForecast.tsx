"use client";
import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";
import { getSunTimes } from "@/lib/envCalculations";

const icons: Record<string, string> = {
  cerah: "clear_day", "cerah berawan": "partly_cloudy_day",
  berawan: "cloudy", "berawan tebal": "cloud",
  "hujan ringan": "rainy_light", "hujan sedang": "rainy",
  "hujan lebat": "rainy_heavy", "hujan petir": "thunderstorm",
};
const colors: Record<string, string> = {
  cerah: "text-amber-400", "cerah berawan": "text-amber-400",
  berawan: "text-slate-400", "berawan tebal": "text-slate-500",
  "hujan ringan": "text-sky-500", "hujan sedang": "text-blue-500",
  "hujan lebat": "text-blue-600", "hujan petir": "text-purple-500",
};

function gi(d: string) {
  const k = Object.keys(icons).find((x) => d.toLowerCase().includes(x));
  return icons[k ?? ""] ?? "partly_cloudy_day";
}
function gc(d: string) {
  const k = Object.keys(colors).find((x) => d.toLowerCase().includes(x));
  return colors[k ?? ""] ?? "text-primary-container";
}

/** Build "YYYY-MM-DDTHH:MM" string in the region's local time */
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

export default function HourlyForecast({ forecast }: { forecast: WeatherForecast }) {
  const today = forecast.days[0];
  const tomorrow = forecast.days[1];
  if (!today) return null;

  const now = new Date();
  const sun = getSunTimes(now, forecast.region.latitude, forecast.region.longitude, forecast.region.timezone);

  // ── Tomorrow summary ──
  let tMin = Infinity, tMax = -Infinity, tDom = "";
  const cc: Record<string, number> = {};
  if (tomorrow) {
    for (const p of tomorrow.points) {
      if (p.temperatureC !== null) {
        tMin = Math.min(tMin, p.temperatureC);
        tMax = Math.max(tMax, p.temperatureC);
      }
      cc[p.weatherDescription] = (cc[p.weatherDescription] || 0) + 1;
    }
    tDom = Object.entries(cc).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  }

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowSun = getSunTimes(tomorrowDate, forecast.region.latitude, forecast.region.longitude, forecast.region.timezone);

  const scroll = () =>
    document.getElementById("prakiraan-3-hari")?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Find "now" slot using region-local time ──
  const localNow = formatLocalNow(forecast.region.timezone);
  const points = today.points;

  // ── Only show actual BMKG data slots (no fabrication) ──
  // Mark which slot is closest to current time
  let nearestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < points.length; i++) {
    const diff = Math.abs(new Date(points[i].localDateTime).getTime() - Date.now());
    if (diff < minDiff) {
      minDiff = diff;
      nearestIdx = i;
    }
  }

  const slots = points.map((point, idx) => ({
    key: point.localDateTime,
    isNow: idx === nearestIdx,
    isPast: point.localDateTime < localNow,
    point,
  }));

  return (
    <div id="prakiraan-hari-ini" className="w-full bg-white rounded-[16px] p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark">
          Prakiraan Hari Ini
        </h3>
        <span className="text-[11px] text-primary-container font-medium font-body-sans bg-primary-container/10 px-3 py-1 rounded-full">
          {points.length} Slot
        </span>
      </div>

      <div className="overflow-x-auto pt-3 pb-3">
        <div className="flex gap-2 sm:gap-3 md:gap-4 w-max">
          {slots.map(({ key, isNow, isPast, point }) => (
            <div
              key={key}
              className={`flex-shrink-0 flex flex-col items-center pt-3 pb-2 px-3 sm:px-4 md:px-5 rounded-2xl min-w-[70px] sm:min-w-[80px] md:min-w-[95px] transition-all ${
                isNow
                  ? "bg-accent-container/50 border border-accent/30 shadow-sm -translate-y-1"
                  : isPast
                  ? "opacity-40"
                  : "hover:bg-white/60 cursor-pointer"
              }`}
            >
              <span
                className={`font-body-sans text-xs sm:text-sm md:text-base mb-1 sm:mb-2 ${
                  isNow ? "text-primary-container font-bold" : "text-on-surface-variant"
                }`}
              >
                {formatTime(point.localDateTime)}
              </span>
              <span
                className={`material-symbols-outlined text-[24px] sm:text-[28px] md:text-[32px] mb-1 sm:mb-2 ${isPast ? "text-gray-400" : gc(point.weatherDescription)}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isPast ? "schedule" : gi(point.weatherDescription)}
              </span>
              <span
                className={`font-body-sans font-semibold ${
                  isNow ? "text-primary-container text-[16px] sm:text-[18px] md:text-[20px]" : isPast ? "text-gray-400 text-[14px] sm:text-[16px] md:text-[17px]" : "text-text-dark text-[14px] sm:text-[16px] md:text-[17px]"
                }`}
              >
                {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
              </span>
            </div>
          ))}

        {/* Sun info card */}
        <div className="flex-shrink-0 flex flex-col items-start p-4 md:p-5 rounded-2xl min-w-[160px] md:min-w-[180px] bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 border border-indigo-100/60">
          <span className="text-[10px] md:text-[11px] font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] md:text-[16px]">brightness_low</span> Matahari
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] md:text-[18px] text-orange-500">wb_twilight</span>
              <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans">
                Terbit: <span className="font-semibold">{sun.sunrise}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] md:text-[18px] text-indigo-500">nights_stay</span>
              <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans">
                Terbenam: <span className="font-semibold">{sun.sunset}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tomorrow card */}
        {tomorrow && (
          <div className="flex-shrink-0 flex flex-col items-start p-4 md:p-5 rounded-2xl min-w-[160px] md:min-w-[180px] bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100/60">
            <span className="text-[10px] md:text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] md:text-[16px]">calendar_today</span> Besok
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${gc(tDom)}`}>{gi(tDom)}</span>
                <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans font-semibold truncate max-w-[100px]">{tDom}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] md:text-[18px] text-red-400">thermostat</span>
                <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans">
                  {Math.round(tMin)}° – {Math.round(tMax)}°
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] md:text-[18px] text-orange-500">wb_twilight</span>
                <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans">
                  {tomorrowSun.sunrise}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] md:text-[18px] text-indigo-500">nights_stay</span>
                <span className="text-[11px] md:text-[12px] text-on-surface font-body-sans">
                  {tomorrowSun.sunset}
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      <button
        onClick={scroll}
        className="w-full py-2.5 text-[13px] font-medium text-primary-container hover:bg-primary-container/5 transition-colors rounded-lg font-body-sans flex items-center justify-center gap-1 cursor-pointer"
      >
        Lihat Prakiraan 3 Hari <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
      </button>
    </div>
  );
}
