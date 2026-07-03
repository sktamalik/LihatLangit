/**
 * LihatLangit — Dashboard Prakiraan Cuaca Indonesia
 * Redesigned with rich sections: hero search, trend chart, current weather,
 * environmental metrics, hourly forecast, smart recommendations, 7-day outlook,
 * community reports, and maps.
 */

"use client";

import { useWeather } from "@/lib/useWeather";
import RegionSearch from "@/components/RegionSearch";
import WeatherSummary from "@/components/WeatherSummary";
import TrendChart from "@/components/TrendChart";
import HourlyForecast from "@/components/HourlyForecast";
import WeekForecast from "@/components/WeekForecast";
import EnviroMetrics from "@/components/EnviroMetrics";
import EducationNews from "@/components/EducationNews";
import SeaConditions from "@/components/SeaConditions";
import SunMoon from "@/components/SunMoon";
import SmartTips from "@/components/SmartTips";
import WeatherMap from "@/components/WeatherMap";
import CommunityReports from "@/components/CommunityReports";
import SourceAttribution from "@/components/SourceAttribution";
import WeatherLoadingState from "@/components/WeatherLoadingState";
import WeatherErrorState from "@/components/WeatherErrorState";
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
      {/* ═══ TOP NAVBAR ═══ */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-[0_8px_30px_rgb(14,165,233,0.1)]">
        <div className="flex justify-between items-center w-full px-mobile-margin md:px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <span className="font-geist text-headline-md font-bold text-primary">LihatLangit</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <a className="text-primary border-b-2 border-primary pb-1 font-label-sm text-label-sm" href="#">Dashboard</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Map</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">History</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="text-primary hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">location_on</span>
            </button>
            <button className="text-primary hover:text-primary-container transition-colors">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-grow w-full pb-24 md:pb-8 pt-6">
        <div className="w-full max-w-container-max px-mobile-margin md:px-gutter mx-auto flex flex-col gap-6">

          {/* ─── HERO SEARCH ─── */}
          <section className="relative rounded-3xl bg-sky-surface overflow-hidden p-8 md:p-12 flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.6) 0%, transparent 40%)' }} />
            <div className="absolute left-0 top-1/2 -translate-x-1/4 -translate-y-1/2 pointer-events-none opacity-30">
              <svg width="200" height="120" viewBox="0 0 200 120" fill="none"><path d="M30 90C13.43 90 0 76.57 0 60C0 43.43 13.43 30 30 30C31.5 30 33 30.1 34.5 30.3C40.5 12.5 57.5 0 77.5 0C97.5 0 114.5 12.5 120.5 30.3C122 30.1 123.5 30 125 30C144.33 30 160 45.67 160 65C160 84.33 144.33 100 125 100H30V90Z" fill="white"/></svg>
            </div>
            <h1 className="font-geist text-headline-lg font-semibold text-primary mb-6 relative z-10">Cuaca di sekitarmu</h1>
            <div className="relative w-full max-w-2xl z-10 flex flex-col gap-4">
              <div className="glass-panel flex items-center rounded-full px-6 py-3.5 sky-shadow">
                <span className="material-symbols-outlined text-outline mr-3">search</span>
                <RegionSearch
                  onSelect={searchAndSelect}
                  onGeolocate={requestGeolocation}
                  isGeolocating={state.status === "geolocating"}
                />
              </div>
            </div>
          </section>

          {/* Session status */}
          {state.status === "geo-denied" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">
              Izin lokasi ditolak. Anda tetap bisa mencari wilayah secara manual.
            </div>
          )}
          {state.status === "geo-no-match" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">
              Lokasi tidak ditemukan di dataset. Silakan cari manual.
            </div>
          )}

          {/* ─── LOADING ─── */}
          {state.status === "loading" && <WeatherLoadingState />}

          {/* ─── ERROR ─── */}
          {state.status === "error" && (
            <WeatherErrorState
              code={state.error.code as ErrorCode}
              message={state.error.message}
              onRetry={retry}
            />
          )}

          {/* ─── READY — Full Dashboard ─── */}
          {state.status === "ready" && (
            <>
              {/* Trend Chart */}
              <TrendChart forecast={state.forecast} />

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* LEFT COLUMN (4 cols) */}
                <div className="md:col-span-4 flex flex-col gap-4">
                  <WeatherSummary forecast={state.forecast} />
                  <EnviroMetrics forecast={state.forecast} />
                  <EducationNews forecast={state.forecast} />
                  <SeaConditions forecast={state.forecast} />
                  <SunMoon forecast={state.forecast} />
                </div>

                {/* RIGHT COLUMN (8 cols) */}
                <div className="md:col-span-8 flex flex-col gap-6">
                  <HourlyForecast forecast={state.forecast} />
                  <SmartTips forecast={state.forecast} />
                  <WeatherMap forecast={state.forecast} />
                  <WeekForecast forecast={state.forecast} />
                  <CommunityReports forecast={state.forecast} />
                </div>
              </div>

              {/* Footer attribution */}
              <SourceAttribution
                analysisDateUtc={state.forecast.analysisDateUtc}
                fetchedAt={state.forecast.fetchedAt}
                fromCache={state.forecast.fromCache}
                isStale={state.forecast.isStale}
                regionTimezone={state.forecast.region.timezone}
              />
            </>
          )}
        </div>
      </main>

      {/* ═══ BOTTOM NAV (MOBILE) ═══ */}
      <nav className="bg-white/90 backdrop-blur-lg fixed bottom-0 w-full z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(14,165,233,0.15)] flex justify-around items-center px-4 py-3 md:hidden">
        {[
          { icon: "home", label: "Home", active: true },
          { icon: "map", label: "Peta", active: false },
          { icon: "warning", label: "Peringatan", active: false },
          { icon: "menu", label: "Menu", active: false },
        ].map((item) => (
          <a key={item.icon} href="#" className={`flex flex-col items-center justify-center rounded-2xl px-5 py-1.5 transition-all font-label-sm text-label-sm font-medium ${
            item.active ? "bg-sky-surface text-primary" : "text-outline hover:bg-surface-container-low"
          }`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${item.active ? 1 : 0}` }}>{item.icon}</span>
            <span className="mt-1">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* ═══ FOOTER (DESKTOP) ═══ */}
      <footer className="bg-white/60 backdrop-blur-md w-full mt-stack-gap border-t border-outline-variant/30 max-w-container-max mx-auto px-mobile-margin py-8 hidden md:flex flex-col gap-6 opacity-90 rounded-t-3xl shadow-[0_-8px_30px_rgb(14,165,233,0.05)]">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="text-lg opacity-60">☁️</span>
            <span className="font-label-sm font-bold text-outline">LihatLangit</span>
          </div>
          <div className="flex gap-6 font-label-sm text-label-sm">
            <a className="text-outline hover:text-primary transition-colors flex items-center gap-1" href="#">
              <span className="material-symbols-outlined text-[16px]">warning</span> Peringatan Dini
            </a>
            <a className="text-outline hover:text-primary transition-colors" href="#">Peta Cuaca Nasional</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center w-full pt-4 border-t border-outline-variant/20 text-outline text-[11px]">
          <div>
            Data disediakan oleh BMKG Indonesia. Tidak untuk tujuan navigasi atau operasional kritis.
          </div>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
            <a className="hover:text-primary transition-colors" href="#">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
