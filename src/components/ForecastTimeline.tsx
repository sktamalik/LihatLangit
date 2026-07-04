/**
 * Forecast timeline — segmented day tabs with forecast cards.
 * Desktop: grid layout. Mobile: horizontal scroll per DESIGN.md.
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
      <div className="bg-white border border-outline-variant/20 rounded-xl p-card-padding text-center text-text-muted">
        <p className="text-body-md">Data prakiraan belum tersedia.</p>
      </div>
    );
  }

  const activeDay: WeatherDay = days[activeDayIndex];

  return (
    <div className="animate-fade-in-up space-y-4 h-full flex flex-col">
      {/* Day tabs — segmented control style */}
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
            className={`px-5 py-2.5 rounded-lg font-geist text-label-sm whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              index === activeDayIndex
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-white/60 text-text-muted hover:bg-white/80 hover:text-text-deep"
            }`}
          >
            {day.label}
            <span className="ml-1.5 font-normal opacity-70">
              {formatDayDate(day.date)}
            </span>
          </button>
        ))}
      </div>

      {/* Forecast cards — horizontal scroll on mobile, grid on desktop per DESIGN.md */}
      <div className="flex-1">
        {/* Mobile: horizontal scroll */}
        <div className="flex md:hidden gap-3 overflow-x-auto pb-2 scrollbar-none -mx-mobile-margin px-mobile-margin">
          {activeDay.points.map((point) => (
            <div key={point.localDateTime} className="min-w-[180px] max-w-[200px] flex-shrink-0">
              <ForecastCard
                point={point}
                isNow={
                  nearestPoint?.localDateTime === point.localDateTime &&
                  activeDayIndex === 0
                }
              />
            </div>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
    </div>
  );
}

/** Format date as "3 Jul" for tab display */
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
