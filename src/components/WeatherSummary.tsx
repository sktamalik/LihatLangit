/**
 * Current weather card — the dominant current conditions display.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";

interface WeatherSummaryProps {
  forecast: WeatherForecast;
}

export default function WeatherSummary({ forecast }: WeatherSummaryProps) {
  const { region, nearestPoint, days } = forecast;
  const current = nearestPoint ?? days[0]?.points[0];
  const tz = region.timezone?.includes("Makassar") ? "WITA" : region.timezone?.includes("Jayapura") ? "WIT" : "WIB";

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col items-center text-center relative overflow-hidden">
      {/* Decorative clouds */}
      <div className="absolute left-0 top-1/4 -translate-x-1/2 pointer-events-none opacity-30">
        <svg width="120" height="80" viewBox="0 0 200 120" fill="none">
          <path d="M30 90C13.43 90 0 76.57 0 60C0 43.43 13.43 30 30 30C31.5 30 33 30.1 34.5 30.3C40.5 12.5 57.5 0 77.5 0C97.5 0 114.5 12.5 120.5 30.3C122 30.1 123.5 30 125 30C144.33 30 160 45.67 160 65C160 84.33 144.33 100 125 100H30V90Z" fill="white"/>
        </svg>
      </div>

      {/* Location badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 text-primary bg-sky-surface px-2 py-1 rounded-full border border-white/50">
        <span className="material-symbols-outlined text-[14px]">location_on</span>
        <span className="font-label-sm text-[11px]">{region.city}</span>
      </div>

      {/* Weather icon — color changes with condition */}
      <div className="mt-6 mb-1">
        <span className={`material-symbols-outlined text-[72px] drop-shadow-md ${(() => {
          const desc = current?.weatherDescription.toLowerCase() ?? "";
          if (desc.includes("hujan") && desc.includes("petir")) return "text-purple-600";
          if (desc.includes("hujan lebat")) return "text-blue-700";
          if (desc.includes("hujan")) return "text-blue-500";
          if (desc.includes("berawan tebal") || desc.includes("mendung")) return "text-slate-500";
          if (desc.includes("berawan")) return "text-amber-400";
          if (desc.includes("kabut")) return "text-gray-400";
          if (desc.includes("cerah")) return "text-amber-400";
          return "text-amber-400";
        })()}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {current?.weatherDescription.toLowerCase().includes("hujan") ? "rainy" :
           current?.weatherDescription.toLowerCase().includes("awan") ? "cloud" :
           current?.weatherDescription.toLowerCase().includes("berawan") ? "partly_cloudy_day" :
           "clear_day"}
        </span>
      </div>

      {/* Temperature */}
      <div className="font-geist text-5xl sm:text-6xl font-bold leading-tight text-text-deep mb-0 tracking-tighter">
        {current?.temperatureC !== null ? `${Math.round(current!.temperatureC)}°` : "--"}
      </div>
      <div className="font-geist text-headline-md text-[18px] text-primary mb-4">
        {current?.weatherDescription ?? "—"}
      </div>

      {/* Metrics grid */}
      <div className="w-full grid grid-cols-2 gap-y-3 gap-x-2 border-t border-outline-variant/20 pt-4">
        <Metric icon="humidity_percentage" label="Kelembapan" value={current?.humidityPct !== null ? `${current!.humidityPct}%` : "--"} />
        <Metric icon="air" label="Angin" value={current?.windSpeedKmh !== null ? `${current!.windSpeedKmh} km/h` : "--"} />
        <Metric icon="visibility" label="Jarak Pandang" value={current?.visibilityText ?? "--"} />
        <Metric icon="near_me" label="Arah Angin" value={current?.windDirection ?? "--"} />
      </div>

      {/* Location detail */}
      <div className="mt-3 text-label-sm text-text-muted font-geist">
        {region.village}, {region.district} · {tz}
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="material-symbols-outlined text-outline mb-0.5 text-[20px]">{icon}</span>
      <span className="text-[10px] text-outline">{label}</span>
      <span className="text-[14px] text-on-surface font-semibold">{value}</span>
    </div>
  );
}
