"use client";

import { useWeather } from "@/lib/useWeather";
import RegionSearch from "@/components/RegionSearch";
import WeatherSummary from "@/components/WeatherSummary";
import TrendChart from "@/components/TrendChart";
import HourlyForecast from "@/components/HourlyForecast";
import WeekForecast from "@/components/WeekForecast";
import EnviroMetrics from "@/components/EnviroMetrics";
import SeaConditions from "@/components/SeaConditions";
import SunMoon from "@/components/SunMoon";
import SmartTips from "@/components/SmartTips";
import WeatherMap from "@/components/WeatherMap";
import CommunityReports from "@/components/CommunityReports";
import SourceAttribution from "@/components/SourceAttribution";
import WeatherLoadingState from "@/components/WeatherLoadingState";
import WeatherErrorState from "@/components/WeatherErrorState";
import WarningBanner from "@/components/WarningBanner";
import Toast from "@/components/Toast";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { ErrorCode } from "@/types/weather";

export default function DashboardPage() {
  const { state, searchAndSelect, retry, requestGeolocation } = useWeather();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("hero");

  // ── Intersection observer: track which section is visible ──
  useEffect(() => {
    const sections = document.querySelectorAll("section[id], div[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    sections.forEach((el) => {
      if (el.id) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [state.status]);

  useEffect(() => {
    if (prevStatusRef.current === state.status) return;
    prevStatusRef.current = state.status;
    const id = setTimeout(() => {
      if (state.status === "ready") setToast({ message: `Data cuaca ${state.forecast.region.village} berhasil dimuat`, type: "success" });
      else if (state.status === "error") setToast({ message: state.error.message, type: "error" });
      else if (state.status === "geo-denied") setToast({ message: "Izin lokasi ditolak.", type: "error" });
      else if (state.status === "geo-no-match") setToast({ message: "Lokasi tidak ditemukan.", type: "error" });
    }, 0);
    return () => clearTimeout(id);
  }, [state]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  // ── Nav link helper ──
  const navLink = (id: string, label: string) => {
    const isActive = activeSection === id;
    return (
      <a
        onClick={() => scrollTo(id)}
        className={`font-body-sans text-[14px] cursor-pointer transition-colors duration-200 border-b-2 pb-0.5 ${isActive
          ? "text-primary-container border-primary-container font-semibold"
          : "text-on-surface-variant border-transparent hover:text-primary-container"
          }`}
      >
        {label}
      </a>
    );
  };

  const featureCards = [
    { icon: "database", title: "Data Resmi BMKG", desc: "Seluruh data prakiraan cuaca berasal langsung dari Badan Meteorologi, Klimatologi, dan Geofisika Indonesia." },
    { icon: "travel_explore", title: "Cakupan Nasional", desc: "Cari prakiraan cuaca hingga level desa/kelurahan di seluruh Indonesia. Dari Sabang sampai Merauke." },
    { icon: "schedule", title: "Selalu Update", desc: "Data prakiraan diperbarui secara berkala mengikuti jadwal pembaruan resmi dari BMKG." },
  ];

  return (
    <>
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* NAVBAR — only element with elevated z-index */}
      <nav className="sticky top-0 w-full z-50 border-b border-outline-variant bg-white">
        <div className="flex justify-between items-center px-5 md:px-20 py-4 max-w-full">
          <div className="flex items-center gap-4">
            <a href="#" className="font-display-pixel text-[16px] text-text-dark flex items-center gap-2 no-underline">
              <Image src="/icon.png" alt="" width={24} height={24} className="w-6 h-6" />
              lihatlangit
            </a>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {navLink("app-preview", "Dashboard")}
            {navLink("features", "Fitur")}
            {navLink("peta-cuaca", "Peta Cuaca")}
            {navLink("peringatan-dini", "Peringatan")}
            <a href="https://www.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary-container transition-colors duration-200 font-body-sans flex items-center gap-1 text-[14px] no-underline">BMKG <span className="material-symbols-outlined text-[16px]">open_in_new</span></a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={requestGeolocation} disabled={state.status === "geolocating"} className="hidden md:block text-primary-container font-body-sans font-medium hover:text-primary transition-colors duration-200 text-[14px] disabled:opacity-50">
              {state.status === "ready" ? state.forecast.region.city : "Lokasi Saya"}
            </button>
            <button onClick={() => scrollTo("hero")} className="bg-primary-container text-white px-6 py-2 rounded-md font-body-sans text-[16px] font-medium hover:bg-primary-container/90 transition-colors flex items-center gap-1 cursor-pointer">
              Mulai <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* HERO */}
        <section id="hero" className="flex flex-col items-center justify-center text-center px-5 md:px-20 pt-24 pb-12 w-full max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 pr-4 pl-1 py-1 rounded-full bg-white border border-outline-variant mb-10 shadow-sm">
            <span className="px-3 py-1 rounded-full bg-primary-container text-white font-body-sans text-[12px] font-bold">Baru</span>
            <span className="font-body-sans text-[14px] text-primary-container font-medium flex items-center gap-1">Data real-time dari BMKG <span className="material-symbols-outlined text-[16px]">arrow_forward</span></span>
          </div>
          <h1 className="font-display-pixel text-[24px] md:text-[36px] lg:text-[48px] text-text-dark leading-[1.3] mb-6 max-w-4xl uppercase tracking-tight">
            Cuaca akurat <br /><span className="text-primary-container">langsung dari BMKG</span>
          </h1>
          <p className="font-body-sans text-[16px] md:text-[18px] text-on-surface-variant mb-10 max-w-2xl font-medium">
            LihatLangit memberikan prakiraan cuaca tingkat desa/kelurahan berdasarkan data resmi BMKG.
          </p>
          <div className="flex flex-col items-center gap-6 mb-4">
            <button onClick={() => scrollTo("hero-search")} className="bg-primary-container text-white px-8 py-3.5 rounded-md font-body-sans text-[18px] font-medium hover:bg-primary-container/90 transition-transform hover:scale-105 flex items-center gap-2 shadow-sm cursor-pointer">
              Cari Wilayah <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex items-center gap-6 text-on-surface-variant font-body-sans text-[14px] font-medium">
              <button onClick={requestGeolocation} disabled={state.status === "geolocating"} className="flex items-center gap-2 hover:text-text-dark transition-colors cursor-pointer disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">my_location</span> Gunakan Lokasi Saat Ini
              </button>
              <a onClick={() => scrollTo("peta-cuaca")} className="flex items-center gap-2 hover:text-text-dark transition-colors cursor-pointer no-underline">
                <span className="material-symbols-outlined text-[18px]">map</span> Peta Interaktif
              </a>
            </div>
          </div>
          {state.status === "geo-denied" && <div className="mt-4 bg-white rounded-lg px-4 py-2 text-sm text-text-muted border border-outline-variant">Izin lokasi ditolak.</div>}
          {state.status === "geo-no-match" && <div className="mt-4 bg-white rounded-lg px-4 py-2 text-sm text-text-muted border border-outline-variant">Lokasi tidak ditemukan.</div>}
          <div id="hero-search" className="w-full max-w-3xl mt-8">
            <div className="bg-white flex items-center rounded-full px-6 py-4 border border-outline-variant shadow-sm">
              <span className="material-symbols-outlined text-outline mr-3 text-[24px]">search</span>
              <RegionSearch onSelect={searchAndSelect} />
            </div>
          </div>
        </section>

        {/* APP UI MOCKUP */}
        <section id="app-preview" className="px-5 md:px-20 py-12 w-full flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-outline-variant overflow-hidden flex flex-col md:flex-row min-h-[500px]">
            <div className="w-full md:w-64 bg-surface-bright flex flex-col pt-4 pb-6 px-4">
              <div className="flex gap-2 mb-8 mt-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" /><div className="w-3 h-3 rounded-full bg-[#FFBD2E]" /><div className="w-3 h-3 rounded-full bg-[#27C93F]" />
              </div>
              <nav className="flex-grow space-y-1">
                <a onClick={() => scrollTo("hero")} className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors font-body-sans text-[14px] font-medium cursor-pointer no-underline"><span className="material-symbols-outlined text-[20px] text-text-muted">dashboard</span> Dashboard</a>
                <a onClick={() => scrollTo("prakiraan-hari-ini")} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent-container/50 text-accent font-medium font-body-sans text-[14px] cursor-pointer no-underline"><span className="material-symbols-outlined text-[20px]">pin_drop</span> Prakiraan</a>
                <a onClick={() => scrollTo("peta-cuaca")} className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors font-body-sans text-[14px] font-medium cursor-pointer no-underline"><span className="material-symbols-outlined text-[20px] text-text-muted">map</span> Peta Cuaca</a>
                <a onClick={() => scrollTo("peringatan-dini")} className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors font-body-sans text-[14px] font-medium cursor-pointer no-underline"><span className="material-symbols-outlined text-[20px] text-text-muted">warning</span> Peringatan</a>
              </nav>
            </div>
            <div className="flex-grow bg-white p-6 md:p-8 flex flex-col border-l border-outline-variant/50">
              <h2 className="font-body-sans text-[20px] font-semibold text-text-dark mb-6">{state.status === "ready" ? state.forecast.region.district : "Selamat Datang"}</h2>
              {state.status === "loading" && <WeatherLoadingState />}
              {state.status === "error" && <WeatherErrorState code={state.error.code as ErrorCode} message={state.error.message} onRetry={retry} />}
              {state.status === "ready" && (
                <>
                  <div className="border border-grass-green/20 bg-grass-green/5 rounded-lg p-4 flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-grass-green text-[24px]">verified</span>
                      <div><h3 className="font-body-sans text-[15px] font-semibold text-grass-green">{state.forecast.region.village}, {state.forecast.region.district}</h3><p className="font-body-sans text-[13px] text-on-surface-variant">{state.forecast.nearestPoint?.weatherDescription ?? "Data tersedia"}</p></div>
                    </div>
                    <span className="px-3 py-1 bg-error-container text-on-error-container rounded-md font-body-sans text-[12px] font-medium">{state.forecast.nearestPoint?.temperatureC !== null ? `${Math.round(state.forecast.nearestPoint!.temperatureC)}°C` : "--"}</span>
                  </div>
                  <div className="space-y-3">
                    {state.forecast.days.slice(0, 3).map((day) => {
                      const tMin = Math.min(...day.points.map(p => p.temperatureC ?? 999));
                      const tMax = Math.max(...day.points.map(p => p.temperatureC ?? -999));
                      return (
                        <div key={day.date} className="border border-outline-variant rounded-lg p-3.5 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary-container text-[24px]">{day.points[0]?.weatherDescription.toLowerCase().includes("hujan") ? "rainy" : day.points[0]?.weatherDescription.toLowerCase().includes("awan") ? "cloud" : "clear_day"}</span>
                            <div><h5 className="font-body-sans text-[14px] font-medium text-text-dark">{day.label}</h5><p className="font-body-sans text-[12px] text-on-surface-variant">{day.points[0]?.weatherDescription ?? "—"}</p></div>
                          </div>
                          <span className="font-body-sans text-[14px] font-semibold text-text-dark">{tMin !== 999 ? `${Math.round(tMin)}°` : "--"} – {tMax !== -999 ? `${Math.round(tMax)}°` : "--"}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* DATA DASHBOARD */}
        {state.status === "ready" && (
          <div id="features" className="px-4 md:px-12 pb-8 pt-8 w-full max-w-[1800px] mx-auto flex flex-col gap-8">
            <h3 className="font-display-pixel text-[14px] md:text-[18px] text-text-dark text-center uppercase">
              Visualisasi Data Real-Time <span className="text-primary-container">dari BMKG.</span>
            </h3>
            <TrendChart forecast={state.forecast} />
            <div id="peta-cuaca" className="w-full"><WeatherMap forecast={state.forecast} /></div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full">
              <div className="md:col-span-5"><WeatherSummary forecast={state.forecast} /></div>
              <div className="md:col-span-7"><WeekForecast forecast={state.forecast} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              <EnviroMetrics forecast={state.forecast} />
              <SeaConditions forecast={state.forecast} />
              <SunMoon forecast={state.forecast} />
              <SmartTips forecast={state.forecast} />
            </div>
            {/* Row: Prakiraan Hari Ini + Status Data — 2 columns side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <HourlyForecast forecast={state.forecast} />
              <CommunityReports forecast={state.forecast} />
            </div>
            {/* Peringatan Dini — full width */}
            <div id="peringatan-dini" className="w-full"><WarningBanner /></div>
          </div>
        )}

        {state.status === "loading" && (
          <div className="px-5 md:px-20 py-12 w-full max-w-5xl mx-auto"><WeatherLoadingState /></div>
        )}
        {state.status === "error" && (
          <div className="px-5 md:px-20 py-12 w-full max-w-5xl mx-auto"><WeatherErrorState code={state.error.code as ErrorCode} message={state.error.message} onRetry={retry} /></div>
        )}
      </main>

      {/* BOTTOM: CTA + 3 Cards + Source + Grass + Footer */}
      <div>
        <section className="px-5 md:px-20 pb-24 pt-12 w-full max-w-6xl mx-auto flex flex-col items-center">
          <h3 className="font-display-pixel text-[14px] md:text-[18px] text-text-dark text-center mb-20 uppercase">
            Cuaca akurat dari sumber <span className="text-primary-container">terpercaya.</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {featureCards.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-container/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary-container text-[32px]">{card.icon}</span>
                </div>
                <h4 className="font-body-sans text-[20px] font-semibold text-text-dark mb-3">{card.title}</h4>
                <p className="font-body-sans text-[14px] text-on-surface-variant leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {state.status === "ready" && (
          <div className="px-5 md:px-20 pb-8 w-full max-w-6xl mx-auto">
            <SourceAttribution analysisDateUtc={state.forecast.analysisDateUtc} fetchedAt={state.forecast.fetchedAt} fromCache={state.forecast.fromCache} isStale={state.forecast.isStale} regionTimezone={state.forecast.region.timezone} />
          </div>
        )}

        <div className="w-full h-4" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' fill='%2322C55E'/%3E%3Crect width='4' height='4' fill='%2316a34a'/%3E%3Crect x='8' y='8' width='4' height='4' fill='%2316a34a'/%3E%3C/svg%3E\")", backgroundSize: "8px 8px", imageRendering: "pixelated" }} />

        <footer className="bg-[#5A3714] text-white pt-24 pb-12 w-full">
          <div className="max-w-7xl mx-auto px-5 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
              <div className="md:col-span-6 flex flex-col gap-8">
                <div className="flex items-center gap-8">
                  <a href="#" className="font-display-pixel text-[32px] text-white tracking-tight no-underline">lihatlangit</a>
                  <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-[14px] font-medium no-underline"><span className="material-symbols-outlined text-[18px]">open_in_new</span> data.bmkg.go.id</a>
                </div>
                <div className="max-w-xl"><p className="text-white text-[16px] leading-relaxed font-medium">&ldquo;Memprediksi cuaca bukan sekadar ilmu, tetapi juga seni memahami alam.&rdquo;</p><p className="text-white/90 text-[12px] text-right mt-4">— Data untuk <span className="font-bold">Indonesia</span></p></div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-4"><span className="text-white font-bold text-[14px] mb-2">Navigasi</span><a onClick={() => scrollTo("hero")} className="text-white/90 hover:text-white transition-colors text-[13px] cursor-pointer no-underline">Dashboard</a><a onClick={() => scrollTo("features")} className="text-white/90 hover:text-white transition-colors text-[13px] cursor-pointer no-underline">Prakiraan</a><a onClick={() => scrollTo("peta-cuaca")} className="text-white/90 hover:text-white transition-colors text-[13px] cursor-pointer no-underline">Peta</a><a onClick={() => scrollTo("peringatan-dini")} className="text-white/90 hover:text-white transition-colors text-[13px] cursor-pointer no-underline">Peringatan</a></div>
              <div className="md:col-span-2 flex flex-col gap-4"><span className="text-white font-bold text-[14px] mb-2">Sumber</span><a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors text-[13px] no-underline">BMKG Data</a><a href="https://www.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors text-[13px] no-underline">BMKG Site</a></div>
              <div className="md:col-span-2 flex flex-col gap-4"><span className="text-white font-bold text-[14px] mb-2">Komunitas</span><a href="#" className="text-white/90 hover:text-white transition-colors text-[13px] no-underline">GitHub</a><a href="#" className="text-white/90 hover:text-white transition-colors text-[13px] no-underline">Twitter</a></div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/60 text-[12px] font-medium gap-4">
              <p>© 2026 LihatLangit. Dibuat oleh sktafolio.</p>
              <p>Data bersumber dari BMKG Indonesia.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
