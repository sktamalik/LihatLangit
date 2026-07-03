/**
 * LihatLangit — Dashboard Prakiraan Cuaca Indonesia
 *
 * Main dashboard page using 12-column grid on desktop per DESIGN.md.
 * Mobile: single-column stack. Desktop: summary prominent top section,
 * timeline spans full width below.
 */

"use client";

import RegionSearch from "@/components/RegionSearch";
import WeatherSummary from "@/components/WeatherSummary";
import ForecastTimeline from "@/components/ForecastTimeline";
import SourceAttribution from "@/components/SourceAttribution";
import EmptyState from "@/components/EmptyState";
import WeatherLoadingState from "@/components/WeatherLoadingState";
import WeatherErrorState from "@/components/WeatherErrorState";
import { useWeather } from "@/lib/useWeather";
import type { ErrorCode } from "@/types/weather";

export default function DashboardPage() {
  const {
    state,
    searchAndSelect,
    retry,
    requestGeolocation,
  } = useWeather();

  return (
    <div className="flex-1 flex flex-col relative z-10">
      {/* Header */}
      <header className="w-full py-5 px-mobile-margin md:px-gutter">
        <div className="max-w-container-max mx-auto w-full flex items-center justify-between">
          <div>
            <h1 className="font-geist text-headline-md font-semibold text-text-deep tracking-tight">
              LihatLangit
            </h1>
            <p className="text-body-sm text-text-muted -mt-0.5">
              Prakiraan cuaca Indonesia &middot; Sumber: BMKG
            </p>
          </div>
        </div>
      </header>

      {/* Main Content — 12-column grid */}
      <main className="flex-1 w-full px-mobile-margin md:px-gutter pb-10">
        <div className="max-w-container-max mx-auto w-full">
          {/* Search — full width */}
          <section aria-label="Pencarian wilayah" className="mb-6">
            <RegionSearch
              onSelect={searchAndSelect}
              onGeolocate={requestGeolocation}
              isGeolocating={state.status === "geolocating"}
            />
          </section>

          {/* Geo status messages — full width */}
          <div className="mb-6">
            {state.status === "geo-denied" && (
              <GeoMessage message="Izin lokasi ditolak. Anda tetap bisa mencari wilayah secara manual." />
            )}
            {state.status === "geo-unavailable" && (
              <GeoMessage message="Geolokasi tidak tersedia. Silakan cari wilayah secara manual." />
            )}
            {state.status === "geo-no-match" && (
              <GeoMessage message="Lokasi Anda belum tersedia di dataset. Coba cari wilayah lain." />
            )}
          </div>

          {/* Dashboard content — 12-column grid */}
          {state.status === "idle" && (
            <div className="col-span-full">
              <EmptyState />
            </div>
          )}

          {state.status === "loading" && (
            <div className="col-span-full">
              <WeatherLoadingState />
            </div>
          )}

          {state.status === "geolocating" && (
            <div className="col-span-full">
              <WeatherLoadingState />
            </div>
          )}

          {state.status === "ready" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Weather Summary — full width on mobile, 4 columns sidebar or prominent top on desktop */}
              <div className="md:col-span-12 lg:col-span-5 xl:col-span-4">
                <WeatherSummary forecast={state.forecast} />
              </div>

              {/* Forecast Timeline — remaining 8 columns */}
              <div className="md:col-span-12 lg:col-span-7 xl:col-span-8">
                <ForecastTimeline forecast={state.forecast} />
              </div>

              {/* Source Attribution — full width at bottom */}
              <div className="md:col-span-12">
                <SourceAttribution
                  analysisDateUtc={state.forecast.analysisDateUtc}
                  fetchedAt={state.forecast.fetchedAt}
                  fromCache={state.forecast.fromCache}
                  isStale={state.forecast.isStale}
                  regionTimezone={state.forecast.region.timezone}
                />
              </div>
            </div>
          )}

          {state.status === "error" && (
            <div className="col-span-full">
              <WeatherErrorState
                code={state.error.code as ErrorCode}
                message={state.error.message}
                onRetry={retry}
                onChangeRegion={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Small info banner for geolocation feedback */
function GeoMessage({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-lg px-4 py-2.5 animate-fade-in-up">
      <p className="text-body-sm text-text-muted flex items-center gap-2">
        <svg className="w-4 h-4 shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
        </svg>
        {message}
      </p>
    </div>
  );
}
