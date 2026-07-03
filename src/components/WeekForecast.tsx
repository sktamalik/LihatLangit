/**
 * 7-day extended forecast.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";

interface WeekForecastProps {
  forecast: WeatherForecast;
}

const weatherIcons: Record<string, string> = {
  "cerah": "☀️",
  "cerah berawan": "⛅",
  "berawan": "☁️",
  "berawan tebal": "☁️",
  "hujan ringan": "🌦️",
  "hujan sedang": "🌧️",
  "hujan lebat": "🌧️",
  "hujan petir": "⛈️",
};

function getIcon(desc: string): string {
  const key = Object.keys(weatherIcons).find((k) => desc.toLowerCase().includes(k));
  return weatherIcons[key ?? ""] ?? "🌤️";
}

function avgTemp(points: { temperatureC: number | null }[]): { min: number; max: number } {
  const valid = points.map((p) => p.temperatureC).filter((t): t is number => t !== null);
  if (valid.length === 0) return { min: 0, max: 0 };
  return { min: Math.round(Math.min(...valid)), max: Math.round(Math.max(...valid)) };
}

function avgHumidity(points: { humidityPct: number | null }[]): number {
  const valid = points.map((p) => p.humidityPct).filter((h): h is number => h !== null);
  if (valid.length === 0) return 0;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

export default function WeekForecast({ forecast }: WeekForecastProps) {
  return (
    <div className="glass-panel rounded-3xl p-card-padding sky-shadow">
      <h2 className="font-geist text-headline-md font-semibold text-primary mb-4">Perkiraan 3 Hari</h2>
      <div className="flex flex-col gap-1">
        {forecast.days.map((day, idx) => {
          const { min, max } = avgTemp(day.points);
          const hum = avgHumidity(day.points);
          const icon = getIcon(day.points[0]?.weatherDescription ?? "");
          return (
            <div key={day.date}>
              <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/60 transition-colors cursor-pointer">
                <span className={`font-body-md font-semibold w-24 ${idx === 0 ? "text-primary" : "text-on-surface-variant"}`}>
                  {day.label}
                </span>
                <span className="text-2xl w-10">{icon}</span>
                <span className="flex items-center gap-1 w-20 text-primary font-label-sm text-xs">
                  <span className="material-symbols-outlined text-[14px]">water_drop</span> {hum}%
                </span>
                <div className="flex items-center gap-3 w-24 justify-end">
                  <span className="text-body-md text-outline">{min}°</span>
                  <span className="text-body-md font-bold text-on-surface">{max}°</span>
                </div>
              </div>
              {idx < forecast.days.length - 1 && <div className="h-px bg-outline-variant/20 mx-auto w-[95%]" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
