/**
 * Hourly forecast timeline — horizontal scroll on mobile, grid on desktop.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";
import { getSunTimes, getMoonPhase } from "@/lib/envCalculations";

interface HourlyForecastProps {
  forecast: WeatherForecast;
}

const weatherIcons: Record<string, string> = {
  "cerah": "clear_day",
  "cerah berawan": "partly_cloudy_day",
  "berawan": "cloudy",
  "berawan tebal": "cloud",
  "hujan ringan": "rainy_light",
  "hujan sedang": "rainy",
  "hujan lebat": "rainy_heavy",
  "hujan petir": "thunderstorm",
};

const weatherColors: Record<string, string> = {
  "cerah": "text-amber-400",
  "cerah berawan": "text-amber-400",
  "berawan": "text-slate-400",
  "berawan tebal": "text-slate-500",
  "hujan ringan": "text-sky-500",
  "hujan sedang": "text-blue-500",
  "hujan lebat": "text-blue-700",
  "hujan petir": "text-purple-600",
};

function getIcon(desc: string): string {
  const key = Object.keys(weatherIcons).find((k) => desc.toLowerCase().includes(k));
  return weatherIcons[key ?? ""] ?? "partly_cloudy_day";
}

function getIconColor(desc: string): string {
  const key = Object.keys(weatherColors).find((k) => desc.toLowerCase().includes(k));
  return weatherColors[key ?? ""] ?? "text-primary";
}

export default function HourlyForecast({ forecast }: HourlyForecastProps) {
  const today = forecast.days[0];
  const tomorrow = forecast.days[1];
  if (!today) return null;

  const now = new Date();
  const sun = getSunTimes(now, forecast.region.latitude, forecast.region.longitude, forecast.region.timezone);
  const moon = getMoonPhase(now);

  // Tomorrow stats
  let tomorrowMin = Infinity;
  let tomorrowMax = -Infinity;
  let tomorrowDominant = "";
  const conditionCount: Record<string, number> = {};
  if (tomorrow) {
    for (const p of tomorrow.points) {
      if (p.temperatureC !== null) {
        tomorrowMin = Math.min(tomorrowMin, p.temperatureC);
        tomorrowMax = Math.max(tomorrowMax, p.temperatureC);
      }
      conditionCount[p.weatherDescription] = (conditionCount[p.weatherDescription] || 0) + 1;
    }
    tomorrowDominant = Object.entries(conditionCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  }

  // Tomorrow sunrise
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowSun = getSunTimes(tomorrowDate, forecast.region.latitude, forecast.region.longitude, forecast.region.timezone);

  const scrollToWeekForecast = () => {
    document.getElementById("prakiraan-3-hari")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Generate standard BMKG 3-hourly timeline (07:00–22:00) ──
  // BMKG only returns future slots for the current day.
  // We fill missing past slots with gray placeholders so the timeline is complete.
  const standardHours = ["07:00", "10:00", "13:00", "16:00", "19:00", "22:00"];

  const allSlots = standardHours.map((hour) => {
    const existing = today.points.find((p) => p.localDateTime.slice(11, 16) === hour);
    return { hour, point: existing ?? null };
  });

  return (
    <div id="prakiraan-hari-ini" className="weather-card rounded-3xl p-card-padding sky-shadow">
      <h2 className="font-geist text-headline-md font-semibold text-primary mb-4">Prakiraan Hari Ini</h2>
      <div className="flex gap-3 overflow-x-auto pt-3 pb-2">
        {allSlots.map(({ hour, point }) => {
          if (point) {
            const isNow = forecast.nearestPoint?.localDateTime === point.localDateTime;
            return (
              <div
                key={hour}
                className={`flex-shrink-0 flex flex-col items-center pt-6 pb-3 px-3 rounded-2xl min-w-[85px] transition-all ${
                  isNow
                    ? "bg-secondary-container/60 border border-primary/20 shadow-sm -translate-y-1"
                    : "hover:bg-white/60 cursor-pointer"
                }`}
              >
                <span className={`font-label-sm text-label-sm mb-2 ${isNow ? "text-primary font-bold" : "text-outline"}`}>
                  {formatTime(point.localDateTime)}
                </span>
                <span className={`material-symbols-outlined text-[28px] mb-2 ${getIconColor(point.weatherDescription)}`}>{getIcon(point.weatherDescription)}</span>
                <span className={`font-body-md font-semibold ${isNow ? "text-primary text-[18px]" : "text-on-surface"}`}>
                  {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
                </span>
                {point.humidityPct !== null && (
                  <span className="text-[10px] text-primary font-medium mt-1">{point.humidityPct}%</span>
                )}
              </div>
            );
          }
          // ── Placeholder untuk jam pagi yang sudah lewat ──
          return (
            <div
              key={hour}
              className="flex-shrink-0 flex flex-col items-center pt-6 pb-3 px-3 rounded-2xl min-w-[85px] bg-white/30 border border-dashed border-outline-variant/30"
            >
              <span className="font-label-sm text-label-sm text-outline/40 mb-2">{hour}</span>
              <span className="material-symbols-outlined text-[28px] mb-2 text-outline/20">remove</span>
              <span className="font-body-md text-outline/40">--°</span>
            </div>
          );
        })}

        {/* ── Opsi 1: Info Matahari & Malam ── */}
        <div className="flex-shrink-0 flex flex-col items-start p-3 rounded-2xl min-w-[160px] bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 border border-indigo-100/50">
          <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">brightness_low</span> Matahari & Malam
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-orange-500">wb_twilight</span>
              <span className="text-[11px] text-on-surface">Terbenam <strong>{sun.sunset}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-400">wb_sunny</span>
              <span className="text-[11px] text-on-surface">Terbit besok <strong>{tomorrowSun.sunrise}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`material-symbols-outlined text-[16px] text-indigo-400`}>{moon.icon}</span>
              <span className="text-[11px] text-on-surface">{moon.phase} <span className="text-outline">({moon.illumination}%)</span></span>
            </div>
          </div>
        </div>

        {/* ── Opsi 3: Navigasi ke Besok ── */}
        {tomorrow && (
          <button onClick={scrollToWeekForecast}
            className="flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-2xl min-w-[140px] bg-gradient-to-br from-sky-50/80 to-blue-100/30 border border-sky-200/50 hover:from-sky-100 hover:to-blue-200/40 transition-all cursor-pointer group"
          >
            <span className="text-[10px] font-semibold text-sky-700 uppercase tracking-wider mb-0.5">Besok</span>
            <span className={`material-symbols-outlined text-[28px] mb-0.5 ${getIconColor(tomorrowDominant)}`}>{getIcon(tomorrowDominant)}</span>
            <span className="flex items-center gap-2 text-[12px] font-semibold text-on-surface">
              <span className="text-outline">{tomorrowMin !== Infinity ? `${Math.round(tomorrowMin)}°` : "--"}</span>
              <span>{tomorrowMax !== -Infinity ? `${Math.round(tomorrowMax)}°` : "--"}</span>
            </span>
            <span className="text-[10px] text-sky-600 mt-1 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Lihat lengkap <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
