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
  const { state, searchAndSelect, retry, requestGeolocation } = useWeather();
  return (
    <div className="flex-1 flex flex-col">
      {/* ═══ NAVBAR (paling atas, sticky) ═══ */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-[0_8px_30px_rgb(14,165,233,0.08)]">
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
          <div className="flex items-center gap-4 text-primary">
            <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">location_on</span></button>
            <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">settings</span></button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="flex-1 w-full pb-24 md:pb-8 pt-6">
        <div className="max-w-container-max mx-auto px-mobile-margin md:px-gutter flex flex-col gap-6">

          {/* ─── HERO + WELCOME (satu section, tanpa overflow-hidden biar dropdown tembus) ─── */}
          <section className="relative rounded-3xl bg-gradient-to-b from-[#fef9c3] via-[#dbeafe] to-[#e0f2fe] p-8 md:p-12 text-center">
            {/* Sun */}
            <div className="absolute top-6 right-[12%] w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-lg animate-float-slow pointer-events-none" />
            <div className="absolute top-8 right-[12.5%] w-20 h-20 rounded-full bg-amber-200/30 blur-xl pointer-events-none" />
            {/* Clouds */}
            <div className="absolute top-8 left-[4%] opacity-60 animate-float-delayed pointer-events-none">
              <svg width="120" height="50" viewBox="0 0 140 55" fill="none">
                <ellipse cx="40" cy="35" rx="38" ry="15" fill="white" opacity="0.9" />
                <circle cx="32" cy="24" r="17" fill="white" opacity="0.9" />
                <circle cx="55" cy="22" r="14" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div className="absolute bottom-8 right-[8%] opacity-50 animate-float pointer-events-none">
              <svg width="90" height="40" viewBox="0 0 110 45" fill="none">
                <ellipse cx="35" cy="30" rx="32" ry="12" fill="white" opacity="0.85" />
                <circle cx="28" cy="20" r="14" fill="white" opacity="0.85" />
                <circle cx="48" cy="18" r="11" fill="white" opacity="0.85" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-md flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">☁️</span>
              </div>
              <h1 className="font-geist text-3xl md:text-4xl font-bold text-text-deep mb-2">
                Selamat Datang di <span className="text-primary">LihatLangit</span>
              </h1>
              <p className="text-text-muted max-w-xl mx-auto mb-6 text-sm md:text-base">
                Prakiraan cuaca Indonesia dari BMKG. Cari desa/kelurahan, pantau cuaca 3 hari ke depan.
              </p>

              <div className="max-w-xl mx-auto">
                <div className="glass-panel flex items-center rounded-full px-5 py-3 sky-shadow-sm">
                  <span className="material-symbols-outlined text-outline mr-2">search</span>
                  <RegionSearch onSelect={searchAndSelect} onGeolocate={requestGeolocation} isGeolocating={state.status === "geolocating"} />
                </div>
              </div>

              <button onClick={requestGeolocation} disabled={state.status === "geolocating"}
                className="mt-4 px-5 py-2 bg-white/70 text-primary rounded-full text-sm font-geist font-medium border border-white/60 hover:bg-white/90 transition-all disabled:opacity-50">
                📍 Gunakan Lokasi Saya
              </button>
            </div>
          </section>

          {state.status === "geo-denied" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">Izin lokasi ditolak. Cari manual.</div>
          )}
          {state.status === "geo-no-match" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">Lokasi tidak ditemukan.</div>
          )}

          {state.status === "loading" && <WeatherLoadingState />}
          {state.status === "error" && <WeatherErrorState code={state.error.code as ErrorCode} message={state.error.message} onRetry={retry} />}

          {state.status === "ready" && (
            <>
              <TrendChart forecast={state.forecast} />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 flex flex-col gap-4">
                  <WeatherSummary forecast={state.forecast} />
                  <EnviroMetrics forecast={state.forecast} />
                  <EducationNews forecast={state.forecast} />
                  <SeaConditions forecast={state.forecast} />
                  <SunMoon forecast={state.forecast} />
                </div>
                <div className="md:col-span-8 flex flex-col gap-6">
                  <HourlyForecast forecast={state.forecast} />
                  <SmartTips forecast={state.forecast} />
                  <WeatherMap forecast={state.forecast} />
                  <WeekForecast forecast={state.forecast} />
                  <CommunityReports forecast={state.forecast} />
                </div>
              </div>

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

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-white/50 flex justify-around py-2 px-4 z-50 rounded-t-2xl shadow-[0_-4px_20px_rgba(14,165,233,0.12)]">
        {["home","map","warning","menu"].map((icon,i) => (
          <a key={icon} href="#" className={`flex flex-col items-center text-xs font-geist ${i===0?"text-primary":"text-outline"}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
            <span>{["Home","Peta","Peringatan","Menu"][i]}</span>
          </a>
        ))}
      </nav>

      {/* Footer Desktop */}
      <footer className="hidden md:block border-t border-outline-variant/30 mt-6 pt-6 pb-8 text-center text-xs text-outline/70 max-w-container-max mx-auto px-gutter">
        ☁️ LihatLangit — Data: BMKG. Tidak untuk navigasi atau operasional kritis.
      </footer>
    </div>
  );
}
