/**
 * Loading skeleton for the dashboard.
 */

"use client";

export default function WeatherLoadingState() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Trend skeleton */}
      <div className="weather-card rounded-3xl p-card-padding sky-shadow">
        <div className="h-5 w-40 bg-outline-variant/30 rounded animate-pulse-soft mb-4" />
        <div className="h-[180px] bg-surface-container-low rounded-2xl animate-pulse-soft" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="weather-card rounded-3xl p-card-padding sky-shadow h-48 animate-pulse-soft" />
          ))}
        </div>
        <div className="md:col-span-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="weather-card rounded-3xl p-card-padding sky-shadow h-40 animate-pulse-soft" />
          ))}
        </div>
      </div>
    </div>
  );
}
