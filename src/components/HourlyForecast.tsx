"use client";
import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";
import { getSunTimes } from "@/lib/envCalculations";

/** Icon mapping — lebih variatif, solid (FILL=1) */
function getWeatherIcon(desc: string, isPast: boolean, isNow: boolean): string {
  if (isPast) return "history";
  const d = desc.toLowerCase();
  if (d.includes("petir")) return "thunderstorm";
  if (d.includes("hujan lebat")) return "rainy_heavy";
  if (d.includes("hujan sedang")) return "rainy";
  if (d.includes("hujan ringan")) return "rainy_light";
  if (d.includes("hujan")) return "rainy";
  if (d.includes("berawan tebal")) return "cloud";
  if (d.includes("berawan")) return "cloudy";
  if (d.includes("kabut")) return "foggy";
  if (d.includes("cerah berawan")) return isNow ? "partly_cloudy_day" : "wb_cloudy";
  if (d.includes("cerah")) return "sunny";
  if (d.includes("angin")) return "air";
  return "partly_cloudy_day";
}

/** Warna icon */
function iconColor(desc: string, isPast: boolean): string {
  if (isPast) return "text-gray-400";
  const d = desc.toLowerCase();
  if (d.includes("petir")) return "text-purple-500";
  if (d.includes("hujan")) return "text-sky-500";
  if (d.includes("berawan tebal")) return "text-slate-500";
  if (d.includes("berawan")) return "text-slate-400";
  if (d.includes("kabut")) return "text-gray-400";
  if (d.includes("cerah berawan")) return "text-amber-400";
  if (d.includes("cerah")) return "text-amber-500";
  if (d.includes("angin")) return "text-teal-400";
  return "text-primary-container";
}

/** Build "YYYY-MM-DDTHH:MM" string in the region's local time */
function formatLocalNow(timezone?: string): string {
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

  // ── Find "now" slot ──
  const localNow = formatLocalNow(forecast.region.timezone);
  const points = today.points;

  let nearestIdx = 0;
  let minDiff = Infinity;
  for (let i = 0; i < points.length; i++) {
    // Compare localDateTime strings directly (both are in region's local time)
    const diff = Math.abs(new Date(points[i].localDateTime).getTime() - new Date(localNow).getTime());
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

  /** Base card — all cards in the scroll row share this */
  const card = "flex-shrink-0 flex flex-col items-center justify-center rounded-xl border transition-all";

  return (
    <div id="prakiraan-hari-ini" className="w-full h-full bg-white rounded-[16px] p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-body-sans text-[18px] md:text-[20px] font-semibold text-text-dark">
          Prakiraan Hari Ini
        </h3>
        <span className="text-[10px] md:text-[11px] text-primary-container font-medium font-body-sans bg-primary-container/10 px-2.5 py-0.5 rounded-full">
          {points.length} slot
        </span>
      </div>

      {/* Scroll row */}
      <div className="overflow-x-auto pt-1 pl-1 pb-1 flex-grow">
        <div className="flex gap-2.5 w-max h-full items-stretch">
          {/* Weather slots */}
          {slots.map(({ key, isNow, isPast, point }) => {
            const icon = getWeatherIcon(point.weatherDescription, isPast, isNow);
            return (
              <div
                key={key}
                className={`${card} w-[70px] sm:w-[78px] gap-0.5 ${
                  isNow
                    ? "bg-accent-container/60 border-accent/30 shadow-sm ring-1 ring-accent/20"
                    : isPast
                    ? "bg-white border-outline-variant/20 opacity-35"
                    : "bg-white border-outline-variant/20 hover:bg-surface-container-low cursor-pointer"
                }`}
              >
                <span className={`font-body-sans text-[11px] ${isNow ? "text-primary-container font-bold" : "text-on-surface-variant"}`}>
                  {formatTime(point.localDateTime)}
                </span>
                <span
                  className={`material-symbols-outlined text-[24px] sm:text-[26px] ${iconColor(point.weatherDescription, isPast)}`}
                  style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}
                >
                  {icon}
                </span>
                <span className={`font-body-sans font-bold text-[14px] ${isNow ? "text-primary-container" : isPast ? "text-gray-400" : "text-text-dark"}`}>
                  {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
                </span>
              </div>
            );
          })}

          {/* Sun info */}
          <div className={`${card} w-[120px] sm:w-[136px] bg-gradient-to-br from-indigo-50/90 to-indigo-100/40 border-indigo-100/60 gap-1 px-2`}>
            <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">Matahari</span>
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>wb_twilight</span>
                <span className="text-[12px] md:text-[13px] text-on-surface font-body-sans font-semibold">{sun.sunrise}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-indigo-500" style={{ fontVariationSettings: "'FILL' 1" }}>nights_stay</span>
                <span className="text-[12px] md:text-[13px] text-on-surface font-body-sans font-semibold">{sun.sunset}</span>
              </div>
            </div>
          </div>

          {/* Tomorrow card */}
          {tomorrow && (
            <div className={`${card} w-[130px] sm:w-[150px] bg-gradient-to-br from-amber-50/90 to-orange-100/30 border-amber-100/60 gap-1 px-2`}>
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Besok</span>
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[15px] ${iconColor(tDom, false)}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 300" }}>{getWeatherIcon(tDom, false, false)}</span>
                  <span className={`text-[12px] md:text-[13px] font-semibold font-body-sans truncate max-w-[80px] ${iconColor(tDom, false)}`}>{tDom}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>thermostat</span>
                  <span className="text-[12px] md:text-[13px] text-on-surface font-body-sans font-semibold">{Math.round(tMin)}°–{Math.round(tMax)}°</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-text-muted font-body-sans">
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px] text-orange-400" style={{ fontVariationSettings: "'FILL' 1" }}>wb_twilight</span>
                    {tomorrowSun.sunrise}
                  </span>
                  <span className="text-outline/40">•</span>
                  <span className="flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px] text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>nights_stay</span>
                    {tomorrowSun.sunset}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={scroll}
        className="w-full py-2 text-[12px] font-medium text-primary-container hover:bg-primary-container/5 transition-colors rounded-lg font-body-sans flex items-center justify-center gap-1 cursor-pointer mt-2"
      >
        Detail 3 hari <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
      </button>
    </div>
  );
}
