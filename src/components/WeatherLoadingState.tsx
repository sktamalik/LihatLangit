/**
 * Loading skeleton state for the weather dashboard.
 */

"use client";

export default function WeatherLoadingState() {
  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Summary skeleton */}
      <div className="glass-card rounded-xl p-card-padding">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-32 animate-skeleton rounded bg-sky-surface" />
            <div className="h-16 w-48 animate-skeleton rounded bg-sky-surface" />
            <div className="h-4 w-24 animate-skeleton rounded bg-sky-surface" />
          </div>
          <div className="flex gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 animate-skeleton rounded bg-sky-surface" />
                <div className="h-6 w-12 animate-skeleton rounded bg-sky-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-10 w-24 animate-skeleton rounded-lg bg-white/60"
          />
        ))}
      </div>

      {/* Forecast cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-card-padding space-y-3"
          >
            <div className="h-3 w-16 animate-skeleton rounded bg-sky-surface" />
            <div className="h-12 w-12 animate-skeleton rounded-full bg-sky-surface mx-auto" />
            <div className="h-8 w-16 animate-skeleton rounded bg-sky-surface mx-auto" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-skeleton rounded bg-sky-surface" />
              <div className="h-3 w-full animate-skeleton rounded bg-sky-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
