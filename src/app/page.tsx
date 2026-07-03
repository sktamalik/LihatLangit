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
import WarningBanner from "@/components/WarningBanner";
import { useState, useEffect } from "react";
import type { ErrorCode } from "@/types/weather";

const NAV_ITEMS = [
  { id: "hero", label: "Dashboard" },
  { id: "prakiraan-hari-ini", label: "Prakiraan" },
  { id: "peta-cuaca", label: "Peta Cuaca" },
  { id: "peringatan-dini", label: "Peringatan Dini" },
];

export default function DashboardPage() {
  const { state, searchAndSelect, retry, requestGeolocation } = useWeather();
  const [activeNav, setActiveNav] = useState("hero");

  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Update active nav based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveNav(item.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* ═══ NAVBAR ═══ */}
      <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-white/50 shadow-[0_8px_30px_rgb(14,165,233,0.08)]">
        <div className="flex justify-between items-center w-full px-mobile-margin md:px-gutter max-w-container-max mx-auto h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">☁️</span>
            <span className="font-geist text-headline-md font-bold text-primary">LihatLangit</span>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`font-label-sm cursor-pointer pb-1 transition-colors ${
                  activeNav === item.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {state.status === "ready" && (
              <span className="hidden sm:block text-xs text-text-muted font-geist">
                📍 {state.forecast.region.city}
              </span>
            )}
            <button className="text-primary hover:text-primary-container transition-colors" onClick={requestGeolocation} disabled={state.status === "geolocating"} title="Gunakan lokasi">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full pb-24 md:pb-8 pt-6">
        <div className="max-w-container-max mx-auto px-mobile-margin md:px-gutter flex flex-col gap-6">

          {/* ─── HERO + WELCOME ─── */}
          <section id="hero" className="relative rounded-3xl bg-gradient-to-b from-[#fef9c3] via-[#dbeafe] to-[#e0f2fe] p-8 md:p-12 flex flex-col items-center justify-center text-center" style={{ minHeight: "80vh" }}>
            <div className="absolute top-6 right-[12%] w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 shadow-lg animate-float-slow pointer-events-none" />
            <div className="absolute top-8 right-[12.5%] w-20 h-20 rounded-full bg-amber-200/30 blur-xl pointer-events-none" />
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
              <div className="flex flex-wrap justify-center gap-3 mt-5">
                <button onClick={() => scrollTo("prakiraan-hari-ini")}
                  className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-geist font-semibold shadow-md hover:bg-primary/90 active:scale-95 transition-all">
                  Mulai Jelajahi
                </button>
                <button onClick={requestGeolocation} disabled={state.status === "geolocating"}
                  className="px-5 py-2.5 bg-white/70 text-primary rounded-full text-sm font-geist font-medium border border-white/60 hover:bg-white/90 transition-all disabled:opacity-50">
                  📍 Pakai Lokasi Saya
                </button>
              </div>
            </div>
          </section>

          {state.status === "geo-denied" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">Izin lokasi ditolak. Cari manual.</div>
          )}
          {state.status === "geo-no-match" && (
            <div className="glass-panel rounded-xl px-4 py-3 text-center text-text-muted text-sm">Lokasi tidak ditemukan.</div>
          )}

          {/* ─── PERINGATAN DINI — data asli BMKG ─── */}
          <div id="peringatan-dini">
            <WarningBanner />
          </div>

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
                  <div id="peta-cuaca">
                    <WeatherMap forecast={state.forecast} />
                  </div>
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
        {[
          { icon: "home", label: "Home", id: "hero" },
          { icon: "map", label: "Peta", id: "peta-cuaca" },
          { icon: "warning", label: "Peringatan", id: "peringatan-dini" },
        ].map((item) => (
          <button key={item.icon} onClick={() => scrollTo(item.id)}
            className="flex flex-col items-center text-xs font-geist text-outline hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <button onClick={() => scrollTo("prakiraan-hari-ini")}
          className="flex flex-col items-center text-xs font-geist text-outline hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          <span>Prakiraan</span>
        </button>
      </nav>

      {/* ═══ FOOTER ═══ */}
      <footer className="mt-10 pt-8 pb-12 border-t border-outline-variant/20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">☁️</span>
                <span className="font-geist font-bold text-primary text-base">LihatLangit</span>
              </div>
              <p className="text-xs text-text-muted/70 leading-relaxed">
                Dashboard prakiraan cuaca Indonesia. Data resmi dari BMKG untuk masyarakat.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 className="font-geist font-semibold text-xs text-text-deep uppercase tracking-wider mb-3">Navigasi</h4>
              <div className="space-y-2">
                {["Dashboard", "Prakiraan", "Peta Cuaca", "Peringatan Dini"].map((item) => (
                  <button key={item} onClick={() => scrollTo(item === "Dashboard" ? "hero" : item === "Prakiraan" ? "prakiraan-hari-ini" : item === "Peta Cuaca" ? "peta-cuaca" : "peringatan-dini")}
                    className="block text-xs text-text-muted hover:text-primary transition-colors">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Sumber */}
            <div>
              <h4 className="font-geist font-semibold text-xs text-text-deep uppercase tracking-wider mb-3">Sumber Data</h4>
              <div className="space-y-2 text-xs text-text-muted">
                <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">BMKG ↗</a>
                <a href="https://www.bmkg.go.id/alerts/nowcast/id" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">Peringatan Dini BMKG ↗</a>
                <a href="https://data.bmkg.go.id/prakiraan-cuaca" target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors">Prakiraan Cuaca BMKG ↗</a>
              </div>
            </div>

            {/* Kontak & Legal */}
            <div>
              <h4 className="font-geist font-semibold text-xs text-text-deep uppercase tracking-wider mb-3">Informasi</h4>
              <div className="space-y-2 text-xs text-text-muted">
                <p>Data tidak untuk navigasi atau operasional kritis.</p>
                <p>LihatLangit bukan kanal resmi BMKG.</p>
                <p className="text-[10px] text-text-muted/50 mt-2">© 2026 LihatLangit</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] text-text-muted/50">
            <span>Dibuat dengan ☀️ untuk Indonesia</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
