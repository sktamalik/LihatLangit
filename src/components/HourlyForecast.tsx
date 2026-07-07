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
  let nowIdx = -1;
  const points = today.points;
  for (let i = 0; i < points.length; i++) {
    if (points[i].localDateTime >= localNow) {
      nowIdx = i;
      break;
    }
  }
  if (nowIdx === -1) nowIdx = points.length - 1; // all past → last slot

  // Render all available slots for today (BMKG gives up to 8 slots per day)
  const slots = points.map((point, idx) => ({
    key: point.localDateTime.slice(11, 16),
    isNow: idx === nowIdx,
    point,
  }));

  return (
    <div id="prakiraan-hari-ini" className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark">
          Prakiraan Hari Ini
        </h3>
        <span className="text-[11px] text-primary-container font-medium font-body-sans bg-primary-container/10 px-3 py-1 rounded-full">
          {points.length} Slot
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pt-2 pb-2">
        {slots.map(({ key, isNow, point }) => (
          <div
            key={key}
            className={`flex-shrink-0 flex flex-col items-center pt-6 pb-3 px-3 rounded-2xl min-w-[85px] transition-all ${
              isNow
                ? "bg-accent-container/50 border border-accent/30 shadow-sm -translate-y-1"
                : "hover:bg-white/60 cursor-pointer"
            }`}
          >
            <span
              className={`font-body-sans text-sm mb-2 ${
                isNow ? "text-primary-container font-bold" : "text-on-surface-variant"
              }`}
            >
              {formatTime(point.localDateTime)}
            </span>
            <span
              className={`material-symbols-outlined text-[28px] mb-2 ${gc(
                point.weatherDescription
              )}`}
            >
              {gi(point.weatherDescription)}
            </span>
            <span
              className={`font-body-sans font-semibold ${
                isNow ? "text-primary-container text-[18px]" : "text-text-dark"
              }`}
            >
              {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
            </span>
          </div>
        ))}

        {/* Sun info card */}
        <div className="flex-shrink-0 flex flex-col items-start p-3 rounded-2xl min-w-[160px] bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 border border-indigo-100/60">
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">brightness_low</span> Matahari
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-orange-500">wb_twilight</span>
              <span className="text-[11px] text-on-surface font-body-sans">
                Terbenam <strong>{sun.sunset}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span>
              <span className="text-[11px] text-on-surface font-body-sans">
                Terbit <strong>{tomorrowSun.sunrise}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tomorrow preview */}
        {tomorrow && (
          <button
            onClick={scroll}
            className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl min-w-[140px] bg-gradient-to-br from-orange-50/80 to-orange-100/40 border border-orange-200/50 hover:from-orange-100 hover:to-orange-200/40 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-semibold text-orange-700 uppercase tracking-wider mb-0.5 font-body-sans">
              Besok
            </span>
            <span className={`material-symbols-outlined text-[28px] mb-0.5 ${gc(tDom)}`}>
              {gi(tDom)}
            </span>
            <span className="flex items-center gap-2 text-[12px] font-semibold text-text-dark font-body-sans">
              <span className="text-text-muted">{tMin !== Infinity ? `${Math.round(tMin)}°` : "--"}</span>
              <span>{tMax !== -Infinity ? `${Math.round(tMax)}°` : "--"}</span>
            </span>
            <span className="text-[10px] text-primary-container mt-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-body-sans">
              Lihat <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
