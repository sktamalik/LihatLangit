/**
 * LihatLangit — Dashboard Prakiraan Cuaca Indonesia
 *
 * Main dashboard page. First screen is the dashboard (not a landing page).
 * Features region search, weather summary, 3-day forecast timeline,
 * and BMKG source attribution.
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
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-mobile-margin md:px-gutter">
        <div className="max-w-container-max mx-auto w-full">
          <h1 className="font-geist text-headline-md font-semibold text-text-deep">
            LihatLangit
          </h1>
          <p className="text-body-sm text-text-muted -mt-1">
            Prakiraan cuaca Indonesia &middot; Sumber: BMKG
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full px-mobile-margin md:px-gutter pb-8">
        <div className="max-w-container-max mx-auto w-full space-y-6">
          {/* Search */}
          <section aria-label="Pencarian wilayah">
            <RegionSearch
              onSelect={searchAndSelect}
              onGeolocate={requestGeolocation}
              isGeolocating={state.status === "geolocating"}
            />
          </section>

          {/* Geo status messages */}
          {state.status === "geo-denied" && (
            <GeoMessage type="info" message="Izin lokasi ditolak. Anda tetap bisa mencari wilayah secara manual." />
          )}
          {state.status === "geo-unavailable" && (
            <GeoMessage type="info" message="Geolokasi tidak tersedia. Silakan cari wilayah secara manual." />
          )}
          {state.status === "geo-no-match" && (
            <GeoMessage type="info" message="Lokasi Anda belum tersedia di dataset. Coba cari wilayah lain." />
          )}

          {/* Dashboard content */}
          {state.status === "idle" && <EmptyState />}

          {state.status === "loading" && <WeatherLoadingState />}

          {state.status === "geolocating" && <WeatherLoadingState />}

          {state.status === "ready" && (
            <>
              <WeatherSummary forecast={state.forecast} />
              <ForecastTimeline forecast={state.forecast} />
              <SourceAttribution
                analysisDateUtc={state.forecast.analysisDateUtc}
                fetchedAt={state.forecast.fetchedAt}
                fromCache={state.forecast.fromCache}
                isStale={state.forecast.isStale}
                regionTimezone={state.forecast.region.timezone}
              />
            </>
          )}

          {state.status === "error" && (
            <WeatherErrorState
              code={state.error.code as ErrorCode}
              message={state.error.message}
              onRetry={retry}
              onChangeRegion={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/** Small info banner for geolocation feedback */
function GeoMessage({ message }: { type: "info"; message: string }) {
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
