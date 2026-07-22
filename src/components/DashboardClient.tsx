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
import IndonesiaWeatherMap from "@/components/IndonesiaWeatherMap";
import BmkgPressRelease from "@/components/BmkgPressRelease";
import BmkgInfoTabs from "@/components/BmkgInfoTabs";
import CommunityReports from "@/components/CommunityReports";
import SourceAttribution from "@/components/SourceAttribution";
import WeatherLoadingState from "@/components/WeatherLoadingState";
import WeatherErrorState from "@/components/WeatherErrorState";
import WarningBanner from "@/components/WarningBanner";
import SearchNotif from "@/components/SearchNotif";
import type { SearchNotifState } from "@/components/SearchNotif";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { ErrorCode, Region } from "@/types/weather";

export default function DashboardClient() {
  const { state, searchAndSelect, retry, requestGeolocation } = useWeather();
  const [activeSection, setActiveSection] = useState<string>("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchNotif, setSearchNotif] = useState<SearchNotifState | null>(null);
  const [mapZoomTarget, setMapZoomTarget] = useState<{ lat: number; lng: number } | null>(null);
  const userInitiatedZoomRef = useRef(false);
  const prevAdm4Ref = useRef<string | null>(null);

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

  // ── Zoom peta ke wilayah yang dicari user ──
  useEffect(() => {
    if (state.status !== "ready") return;
    const { latitude, longitude, adm4 } = state.forecast.region;
    if (latitude != null && longitude != null && userInitiatedZoomRef.current && prevAdm4Ref.current !== adm4) {
      prevAdm4Ref.current = adm4;
      setMapZoomTarget({ lat: latitude, lng: longitude });
    }
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

  const handleSearchAndSelect = useCallback((region: Region) => {
    userInitiatedZoomRef.current = true;
    searchAndSelect(region);
    setSearchNotif({ village: region.village, district: region.district });
  }, [searchAndSelect]);

  const handleGeolocation = useCallback(() => {
    userInitiatedZoomRef.current = true;
    requestGeolocation();
  }, [requestGeolocation]);

  const featureCards = [
    { icon: "database", title: "Data Resmi BMKG", desc: "Seluruh data prakiraan cuaca dan info cuaca Indonesia berasal langsung dari Badan Meteorologi, Klimatologi, dan Geofisika — sumber cuaca resmi Indonesia." },
    { icon: "travel_explore", title: "Cakupan Nasional", desc: "Cek cuaca hingga level desa/kelurahan di seluruh Indonesia. Dari Sabang sampai Merauke — prakiraan cuaca akurat di mana pun Anda berada." },
    { icon: "schedule", title: "Update Real-Time", desc: "Data prakiraan cuaca BMKG terkini yang diperbarui secara berkala. Cek suhu, kelembapan, dan peringatan dini cuaca ekstrem kapan saja." },
  ];

  return (
    <>
      <SearchNotif notif={searchNotif} onDismiss={() => setSearchNotif(null)} />

      {/* NAVBAR — only element with elevated z-index */}
      <nav className="sticky top-0 w-full z-50 bg-white relative">
        <div className="flex justify-between items-center px-4 sm:px-5 md:px-20 py-3 md:py-4 max-w-full">
          <div className="flex items-center gap-2 sm:gap-4">
            <a href="#" className="flex items-center no-underline">
              <Image src="/Headericon.png" alt="LihatLangit — Cek Cuaca Indonesia Real-Time dari BMKG" width={120} height={32} className="h-8 sm:h-9 md:h-10 w-auto" priority />
            </a>
          </div>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {navLink("app-preview", "Dashboard")}
            {navLink("features", "Fitur")}
            {navLink("peta-cuaca", "Peta Cuaca")}
            {navLink("peringatan-dini", "Peringatan")}
            <a href="https://www.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary-container transition-colors duration-200 font-body-sans flex items-center gap-1 text-[12px] lg:text-[14px] no-underline">BMKG <span className="material-symbols-outlined text-[14px] lg:text-[16px]">open_in_new</span></a>
          </div>
          {/* Right side: desktop location button + mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* Desktop only: Lokasi Saya button */}
            <button onClick={handleGeolocation} disabled={state.status === "geolocating"} className="hidden md:block text-primary-container font-body-sans font-medium hover:text-primary transition-colors duration-200 text-[14px] disabled:opacity-50 cursor-pointer">
              {state.status === "ready" ? state.forecast.region.city : "Lokasi Saya"}
            </button>
            {/* Mobile only: Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-text-dark hover:text-primary-container transition-colors duration-200 p-1.5 cursor-pointer rounded-md hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu — sidebar dari kanan */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/10 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Sidebar panel */}
            <div className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 md:hidden flex flex-col shadow-[4px_0_20px_rgba(0,0,0,0.08)]">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Image src="/Headericon.png" alt="LihatLangit" width={120} height={32} className="h-8 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-text-dark hover:text-primary-container transition-colors duration-200 p-1 cursor-pointer rounded-md hover:bg-gray-100"
                  aria-label="Tutup menu"
                >
                  <span className="material-symbols-outlined text-[24px]">close</span>
                </button>
              </div>
              {/* Sidebar nav items */}
              <div className="flex flex-col px-4 py-4 gap-1 flex-grow">
                {[
                  { id: "app-preview", label: "Dashboard", icon: "dashboard" },
                  { id: "features", label: "Fitur", icon: "star" },
                  { id: "peta-cuaca", label: "Peta Cuaca", icon: "map" },
                  { id: "peringatan-dini", label: "Peringatan", icon: "warning" },
                ].map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      onClick={() => {
                        scrollTo(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`font-body-sans text-[15px] cursor-pointer transition-all duration-200 py-3 px-4 rounded-xl flex items-center gap-3 ${isActive
                        ? "text-primary-container bg-primary-container/10 font-semibold"
                        : "text-on-surface-variant hover:text-primary-container hover:bg-gray-50"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.label}
                    </a>
                  );
                })}
              </div>
              {/* Sidebar footer */}
              <div className="px-4 pb-5 flex flex-col gap-1 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    handleGeolocation();
                    setMobileMenuOpen(false);
                  }}
                  disabled={state.status === "geolocating"}
                  className="font-body-sans text-[15px] text-primary-container font-medium hover:bg-primary-container/10 py-3 px-4 rounded-xl flex items-center gap-3 text-left transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">my_location</span>
                  {state.status === "ready" ? state.forecast.region.city : "Lokasi Saya"}
                </button>
                <a
                  href="https://www.bmkg.go.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body-sans text-[15px] text-on-surface-variant hover:text-primary-container py-3 px-4 rounded-xl flex items-center gap-3 no-underline transition-all duration-200 hover:bg-gray-50"
                >
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  BMKG
                </a>
              </div>
            </div>
          </>
        )}
      </nav>

      <main className="flex-grow">
        {/* HERO */}
        <section id="hero" className="flex flex-col items-center justify-center text-center px-5 md:px-20 pt-15 pb-12 w-full max-w-5xl mx-auto">
          <a href="#hero-search" className="inline-flex items-center gap-3 pr-4 pl-1 py-1 rounded-full bg-white mb-10 shadow-sm hover:shadow-md transition-shadow no-underline cursor-pointer">
            <span className="px-3 py-1 rounded-full bg-primary-container text-white font-body-sans text-[12px] font-bold">Baru</span>
            <span className="font-body-sans text-[14px] text-primary-container font-medium flex items-center gap-1">Data real-time dari BMKG <span className="material-symbols-outlined text-[16px] animate-arrow-slide">arrow_forward</span></span>
          </a>
          <h1 className="font-display-pixel text-[24px] md:text-[40px] lg:text-[48px] text-text-dark leading-[32px] md:leading-[48px] lg:leading-[56px] mb-6 max-w-4xl uppercase" style={{ wordSpacing: '-0.2em' }}>
            Cek Cuaca Indonesia <span className="text-primary-container">Real-Time dari BMKG</span>
          </h1>
          <p className="font-body-sans text-[16px] md:text-[18px] text-on-surface-variant mb-10 max-w-2xl font-medium">
            LihatLangit, aplikasi cek cuaca Indonesia terkini. Dapatkan prakiraan cuaca akurat hingga level desa/kelurahan berdasarkan data resmi BMKG. Cek suhu, kelembapan, angin, dan peringatan dini cuaca ekstrem.
          </p>
          <div className="flex flex-col items-center gap-6 mb-4">
            <button onClick={() => scrollTo("hero-search")} className="bg-primary-container text-white px-8 py-3.5 rounded-md font-body-sans text-[18px] font-medium hover:bg-primary-container/90 transition-transform hover:scale-105 flex items-center gap-2 shadow-sm cursor-pointer">
              Cek Cuaca Sekarang <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <div className="flex items-center gap-6 text-on-surface-variant font-body-sans text-[14px] font-medium">
              <button onClick={handleGeolocation} disabled={state.status === "geolocating"} className="flex items-center gap-2 hover:text-text-dark transition-colors cursor-pointer disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">my_location</span> Cek Cuaca di Lokasi Saya
              </button>
              <a onClick={() => scrollTo("peta-cuaca")} className="flex items-center gap-2 hover:text-text-dark transition-colors cursor-pointer no-underline">
                <span className="material-symbols-outlined text-[18px]">map</span> Peta Cuaca Indonesia
              </a>
            </div>
          </div>
          {state.status === "geo-denied" && <div className="mt-4 bg-white rounded-lg px-4 py-2 text-sm text-text-muted">Izin lokasi ditolak.</div>}
          {state.status === "geo-no-match" && <div className="mt-4 bg-white rounded-lg px-4 py-2 text-sm text-text-muted">Lokasi tidak ditemukan.</div>}
          <div id="hero-search" className="w-full max-w-3xl mt-8">
            <div className="bg-white flex items-center rounded-full px-6 py-4 shadow-sm">
              <span className="material-symbols-outlined text-outline mr-3 text-[24px]">search</span>
              <RegionSearch onSelect={handleSearchAndSelect} />
            </div>
          </div>
        </section>

        {/* APP UI MOCKUP */}
        <section id="app-preview" className="px-5 md:px-20 py-12 w-full flex justify-center">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-[500px]">
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
            <div className="flex-grow bg-white p-6 md:p-8 flex flex-col">
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
                        <div key={day.date} className="rounded-lg p-3.5 flex justify-between items-center hover:bg-surface-container-low transition-colors cursor-pointer">
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

        {/* PETA CUACA INDONESIA */}
        <section id="peta-cuaca" className="px-4 md:px-12 pb-8 pt-8 w-full max-w-[1280px] mx-auto">
          <IndonesiaWeatherMap zoomToRegion={mapZoomTarget} />
        </section>

        {/* DATA DASHBOARD */}
        {state.status === "ready" && (
          <div id="features" className="px-4 md:px-12 pb-8 pt-8 w-full max-w-[1280px] mx-auto flex flex-col gap-8">
            <h3 className="font-display-pixel text-[14px] xs:text-[16px] md:text-[22px] text-text-dark text-center uppercase leading-[20px] xs:leading-[24px] md:leading-[30px] tracking-[0.05em] max-w-3xl mx-auto">
              Cek Cuaca & Prakiraan <span className="text-primary-container">Real-Time dari BMKG.</span>
            </h3>
            <TrendChart forecast={state.forecast} />
            {/* Row: Card Celsius (40%) — peta cuaca lokal dihapus, sudah ada peta Indonesia di atas */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8 w-full items-stretch">
              <div className="md:col-span-10 h-full"><WeatherSummary forecast={state.forecast} /></div>
            </div>
            {/* Row: Prakiraan 3 Hari — full width */}
            <div className="w-full"><WeekForecast forecast={state.forecast} /></div>
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

      {/* BERITA & INFORMASI BMKG — sebelum footer */}
      <section id="berita-bmkg" className="px-4 md:px-12 pb-4 pt-4 w-full max-w-[1280px] mx-auto flex flex-col gap-6">
        <BmkgPressRelease />
        <BmkgInfoTabs />
      </section>

      {/* BOTTOM: CTA + 3 Cards + Source + Grass + Footer */}
      <div>
        <section className="px-5 md:px-20 pb-12 pt-12 w-full max-w-6xl mx-auto flex flex-col items-center">
          <h3 className="font-display-pixel text-[14px] xs:text-[16px] md:text-[22px] text-text-dark text-center mb-16 uppercase leading-[20px] xs:leading-[24px] md:leading-[30px] tracking-[0.05em] max-w-3xl mx-auto">
            Cek Cuaca Akurat dari Sumber <span className="text-primary-container">Terpercaya — BMKG.</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {featureCards.map((card) => (
              <div key={card.title} className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col items-center text-center">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-5 md:px-20">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-24">
              <div className="md:col-span-6 flex flex-col gap-6 md:gap-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                  <a href="#" className="flex items-center no-underline">
                    <Image src="/Footericon.png" alt="LihatLangit — Prakiraan Cuaca Indonesia" width={140} height={40} className="h-10 sm:h-11 md:h-12 w-auto" />
                  </a>
                  <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors text-[13px] sm:text-[14px] font-medium no-underline"><span className="material-symbols-outlined text-[16px] sm:text-[18px]">open_in_new</span> data.bmkg.go.id</a>
                </div>
                <div className="max-w-xl"><p className="text-white text-[15px] sm:text-[16px] md:text-[17px] leading-relaxed font-medium">&ldquo;Memprediksi cuaca bukan sekadar ilmu, tetapi juga seni memahami alam.&rdquo;</p>
                  <p className="text-white/60 text-[12px] mt-3">Cek cuaca Indonesia terkini — prakiraan cuaca BMKG, suhu udara, kelembapan, peringatan dini cuaca ekstrem, dan peta cuaca interaktif seluruh Indonesia.</p>
                </div>
              </div>
              <div className="md:col-span-2 flex flex-col gap-3 md:gap-4"><span className="text-white font-bold text-[13px] md:text-[14px] mb-2">Navigasi</span><a onClick={() => scrollTo("hero")} className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] cursor-pointer no-underline">Dashboard</a><a onClick={() => scrollTo("features")} className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] cursor-pointer no-underline">Prakiraan</a><a onClick={() => scrollTo("peta-cuaca")} className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] cursor-pointer no-underline">Peta</a><a onClick={() => scrollTo("peringatan-dini")} className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] cursor-pointer no-underline">Peringatan</a></div>
              <div className="md:col-span-2 flex flex-col gap-3 md:gap-4"><span className="text-white font-bold text-[13px] md:text-[14px] mb-2">Sumber</span><a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] no-underline">BMKG Data</a><a href="https://www.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] no-underline">BMKG Site</a></div>
              <div className="md:col-span-2 flex flex-col gap-3 md:gap-4"><span className="text-white font-bold text-[13px] md:text-[14px] mb-2">Komunitas</span><a href="#" className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] no-underline">GitHub</a><a href="#" className="text-white/90 hover:text-white transition-colors text-[12px] md:text-[13px] no-underline">Twitter</a></div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-white/60 text-[11px] sm:text-[12px] font-medium gap-4">
              <p>© 2026 LihatLangit. Dibuat oleh sktafolio.</p>
              <p>Data bersumber dari BMKG Indonesia.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
