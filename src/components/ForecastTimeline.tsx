/**
 * Forecast timeline — segmented day tabs with forecast cards.
 */

"use client";

import { useState } from "react";
import type { WeatherForecast, WeatherDay } from "@/types/weather";
import ForecastCard from "./ForecastCard";

interface ForecastTimelineProps {
  forecast: WeatherForecast;
}

export default function ForecastTimeline({
  forecast,
}: ForecastTimelineProps) {
  const { days, nearestPoint } = forecast;
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (days.length === 0) {
    return (
      <div className="glass-card rounded-xl p-card-padding text-center text-text-muted">
        <p className="text-body-md">Data prakiraan belum tersedia.</p>
      </div>
    );
  }

  const activeDay: WeatherDay = days[activeDayIndex];

  return (
    <div className="animate-fade-in-up space-y-4">
      {/* Day tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label="Hari prakiraan"
      >
        {days.map((day, index) => (
          <button
            key={day.date}
            role="tab"
            aria-selected={index === activeDayIndex}
            onClick={() => setActiveDayIndex(index)}
            className={`px-4 py-2 rounded-lg font-geist text-label-sm whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              index === activeDayIndex
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-white/60 text-text-muted hover:bg-white/80"
            }`}
          >
            {day.label}
            <span className="ml-1 font-normal opacity-70">
              {formatDayDate(day.date)}
            </span>
          </button>
        ))}
      </div>

      {/* Forecast cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {activeDay.points.map((point) => (
          <ForecastCard
            key={point.localDateTime}
            point={point}
            isNow={
              nearestPoint?.localDateTime === point.localDateTime &&
              activeDayIndex === 0
            }
          />
        ))}
      </div>
    </div>
  );
}

/** Format date as "3/7" for tab display */
function formatDayDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}
