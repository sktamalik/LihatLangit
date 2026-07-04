/**
 * Hourly forecast timeline — horizontal scroll on mobile, grid on desktop.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";

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
  if (!today) return null;

  return (
    <div id="prakiraan-hari-ini" className="weather-card rounded-3xl p-card-padding sky-shadow">
      <h2 className="font-geist text-headline-md font-semibold text-primary mb-4">Prakiraan Hari Ini</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
        {today.points.map((point) => {
          const isNow = forecast.nearestPoint?.localDateTime === point.localDateTime;
          return (
            <div
              key={point.localDateTime}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl min-w-[85px] transition-all ${
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
        })}
      </div>
    </div>
  );
}
