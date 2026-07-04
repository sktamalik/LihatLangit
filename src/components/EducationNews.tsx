/**
 * Education & news card — dynamic content based on weather.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { getEducationContent } from "@/lib/envCalculations";

interface EducationNewsProps {
  forecast: WeatherForecast;
}

export default function EducationNews({ forecast }: EducationNewsProps) {
  const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const items = getEducationContent(
    pt?.humidityPct ?? 70,
    pt?.temperatureC ?? 28,
    pt?.weatherDescription ?? ""
  );

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col">
      <h2 className="font-geist text-[18px] font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">school</span> Edukasi & Berita
      </h2>
      <div className="flex flex-col gap-3">
        {items.slice(0, 2).map((item, i) => (
          <div key={i} className={`p-3 rounded-xl border ${item.color}`}>
            <h3 className="text-[12px] font-semibold text-primary-container mb-0.5">{item.title}</h3>
            <p className="text-[12px] text-on-surface-variant leading-snug">{item.text}</p>
          </div>
        ))}
        <a
          href="https://www.bmkg.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-primary font-medium hover:underline self-end px-1"
        >
          Info BMKG →
        </a>
      </div>
    </div>
  );
}
