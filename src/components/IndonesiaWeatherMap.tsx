"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { INDONESIA_CITIES, getWeatherColor, getWeatherLabel } from "@/data/indonesia-cities";

/** Single city weather data from batch API */
interface CityWeather {
  region: { city: string; district: string; village: string };
  temperatureC: number | null;
  weatherDescription: string;
  humidityPct: number | null;
  windSpeedKmh: number | null;
  iconUrl?: string;
  analysisDateUtc: string | null;
  isStale: boolean;
}

type CityWeatherMap = Record<string, CityWeather>;

/** Peta cuaca seluruh Indonesia dengan indikator warna seperti BMKG */
export default function IndonesiaWeatherMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const legendRef = useRef<L.Control | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [weatherData, setWeatherData] = useState<CityWeatherMap | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showIndicators, setShowIndicators] = useState(true);

  // ── Fetch weather for all cities ──
  const fetchAllWeather = useCallback(async () => {
    setIsFetching(true);
    setFetchError(false);
    try {
      const codes = INDONESIA_CITIES.map((c) => c.adm4).join(",");
      const res = await fetch(`/api/weather-batch?adm4=${encodeURIComponent(codes)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: CityWeatherMap = await res.json();
      setWeatherData(data);
    } catch {
      setFetchError(true);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchAllWeather();
  }, [fetchAllWeather]);

  // ── Init map once ──
  useEffect(() => {
    let destroyed = false;
    const initMap = async () => {
      try {
        const LModule = await import("leaflet");
        const L = LModule.default;
        LRef.current = L;

        // Fix marker icons
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (destroyed || !mapContainer.current || mapInstance.current) return;

        const map = L.map(mapContainer.current, {
          center: [-2.5, 118.0],
          zoom: 5,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
          minZoom: 4,
          maxZoom: 12,
        }).setMaxBounds([
          [-12, 94],
          [7, 142],
        ]);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        mapInstance.current = map;

        markersLayerRef.current = L.layerGroup().addTo(map);

        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 300);
        if (!destroyed) setMapReady(true);
      } catch {
        if (!destroyed) setLoadError(true);
      }
    };
    initMap();
    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // ── Update markers when data changes ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !LRef.current || !markersLayerRef.current) return;
    const L = LRef.current;
    markersLayerRef.current.clearLayers();

    for (const city of INDONESIA_CITIES) {
      const data = weatherData?.[city.adm4];
      const temp = data?.temperatureC;
      const desc = data?.weatherDescription ?? "Memuat...";
      const color = data ? getWeatherColor(desc) : "#9ca3af";
      const label = data ? getWeatherLabel(desc) : "—";

      const circle = L.circle([city.latitude, city.longitude], {
        radius: temp != null ? 10000 + Math.abs(temp) * 2000 : 12000,
        color,
        fillColor: color,
        fillOpacity: 0.35,
        weight: 2,
        opacity: 0.7,
      });

      const tempStr = temp != null ? `${Math.round(temp)}°C` : "--";
      const humStr = data?.humidityPct != null ? `${data.humidityPct}%` : "--";
      const windStr = data?.windSpeedKmh != null ? `${data.windSpeedKmh} km/j` : "--";
      const iconHtml = data?.iconUrl
        ? `<img src="${data.iconUrl}" alt="${desc}" style="width:36px;height:36px;vertical-align:middle;margin-right:8px"/>`
        : `<span class="weather-emoji">${getWeatherEmoji(desc)}</span>`;

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;font-size:13px;line-height:1.5;min-width:160px;position:relative">
          <button class="popup-close-btn" data-adm4="${city.adm4}" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;border-radius:50%;background:#0C4A6E;color:white;border:none;font-size:16px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:1000;line-height:1;padding:0">×</button>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            ${iconHtml}
            <div>
              <b style="font-size:15px;color:#0C4A6E">${city.name}</b>
              <div style="font-size:11px;color:#64748B">${city.province}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin:4px 0">
            <span style="font-size:22px;font-weight:700;color:#0C4A6E">${tempStr}</span>
            <span style="font-size:12px;color:#64748B;text-transform:uppercase">${label}</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#475569;border-top:1px solid #e2e8f0;padding-top:6px;margin-top:4px">
            <span>💧 ${humStr}</span>
            <span>🌬️ ${windStr}</span>
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-top:6px;border-top:1px solid #e2e8f0;padding-top:4px">
            ${data?.region.village}, ${data?.region.district}
          </div>
        </div>
      `;

      const popup = L.popup({ className: "weather-popup", closeButton: false, autoClose: true })
        .setContent(popupHtml)
        .setLatLng([city.latitude, city.longitude]);

      circle.bindPopup(popup);
      markersLayerRef.current.addLayer(circle);

      const labelDiv = L.divIcon({
        className: "city-temp-label",
        html: `<div style="
          background:rgba(255,255,255,0.92);
          backdrop-filter:blur(4px);
          border:2px solid ${color};
          border-radius:8px;
          padding:2px 6px;
          font-family:Inter,sans-serif;
          font-size:11px;
          font-weight:700;
          color:#0C4A6E;
          white-space:nowrap;
          text-align:center;
          box-shadow:0 1px 4px rgba(0,0,0,0.12);
          cursor:pointer;
          pointer-events:none;
        ">${tempStr}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, -14],
      });

      const labelMarker = L.marker([city.latitude, city.longitude], {
        icon: labelDiv,
        interactive: false,
      });

      markersLayerRef.current.addLayer(labelMarker);
    }

    // Event delegation for close buttons
    const mapContainerEl = mapInstance.current.getContainer();
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('popup-close-btn')) {
        e.stopPropagation();
        mapInstance.current?.closePopup();
      }
    };

    mapContainerEl.addEventListener('click', handleClick);

    return () => {
      mapContainerEl.removeEventListener('click', handleClick);
    };
  }, [mapReady, weatherData]);

  // ── Legend (added once on map ready) ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !LRef.current) return;
    const L = LRef.current;

    // Remove old legend
    if (legendRef.current) {
      legendRef.current.remove();
      legendRef.current = null;
    }

    const legendItems = [
      { label: "Cerah", color: "#f59e0b" },
      { label: "Cerah Berawan", color: "#60a5fa" },
      { label: "Berawan", color: "#9ca3af" },
      { label: "Berawan Tebal", color: "#6b7280" },
      { label: "Hujan Ringan", color: "#818cf8" },
      { label: "Hujan Sedang", color: "#6366f1" },
      { label: "Hujan Lebat", color: "#4f46e5" },
      { label: "Hujan Petir", color: "#7c3aed" },
    ];

    const LegendControl = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create("div", "weather-legend");
        div.style.cssText = `
          background:rgba(255,255,255,0.95);
          backdrop-filter:blur(8px);
          padding:12px 14px;
          border-radius:12px;
          box-shadow:0 4px 16px rgba(0,0,0,0.1);
          font-family:Inter,sans-serif;
          font-size:12px;
          max-width:180px;
        `;
        div.innerHTML = `
          <div style="font-weight:700;font-size:13px;color:#0C4A6E;margin-bottom:8px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">
            🗺️ Indikator Cuaca
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            ${legendItems.map((item) => `
              <div style="display:flex;align-items:center;gap:6px">
                <span style="
                  display:inline-block;
                  width:14px;height:14px;
                  border-radius:50%;
                  background:${item.color};
                  opacity:0.8;
                  border:1px solid ${item.color};
                "></span>
                <span style="color:#475569">${item.label}</span>
              </div>
            `).join("")}
          </div>
          <div style="font-size:10px;color:#94a3b8;margin-top:8px;border-top:1px solid #e2e8f0;padding-top:6px">
            Suhu (°C) di dalam label
          </div>
        `;
        return div;
      },
    });

    legendRef.current = new LegendControl({ position: "bottomleft" }).addTo(mapInstance.current);
  }, [mapReady]);

  const handleZoomIn = () => { mapInstance.current?.zoomIn(); };
  const handleZoomOut = () => { mapInstance.current?.zoomOut(); };

  const handleRetry = () => { fetchAllWeather(); };

  const totalCities = INDONESIA_CITIES.length;
  const loadedCount = weatherData ? Object.keys(weatherData).length : 0;

  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-body-sans text-[18px] md:text-[20px] font-semibold text-text-dark">
            Peta Prakiraan Cuaca Indonesia
          </h3>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container text-[11px] font-bold font-body-sans">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && (
            <span className="flex items-center gap-1.5 text-[12px] text-text-muted font-body-sans">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              Memuat data {loadedCount}/{totalCities} kota...
            </span>
          )}
          {fetchError && !isFetching && (
            <button onClick={handleRetry} className="flex items-center gap-1 text-[12px] text-error font-body-sans hover:underline cursor-pointer">
              <span className="material-symbols-outlined text-[14px]">refresh</span> Gagal memuat, coba lagi
            </button>
          )}
          {weatherData && !isFetching && (
            <span className="text-[11px] text-text-muted font-body-sans">{loadedCount}/{totalCities} wilayah</span>
          )}
        </div>
      </div>

      {/* Map container */}
      <div className={`w-full h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] rounded-lg overflow-hidden bg-background-sky/30 relative ${!showIndicators ? 'hide-legend' : ''}`}>
        <div ref={mapContainer} className="w-full h-full">
          {!mapReady && !loadError && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm text-text-muted font-body-sans">Memuat peta Indonesia...</span>
            </div>
          )}
          {loadError && (
            <div className="w-full h-full flex items-center justify-center">
              <span className="flex items-center gap-1 text-text-muted font-body-sans">
                <span className="material-symbols-outlined text-[14px]">map</span> Peta tidak dapat dimuat
              </span>
            </div>
          )}
          {mapReady && isFetching && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="text-[12px] text-text-muted font-body-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                Mengambil data cuaca dari BMKG...
              </span>
            </div>
          )}
          {mapReady && fetchError && !isFetching && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-error-container/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <span className="text-[12px] text-on-error-container font-body-sans flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">error_outline</span>
                Gagal memuat data.{" "}
                <button onClick={handleRetry} className="underline font-semibold cursor-pointer">Coba lagi</button>
              </span>
            </div>
          )}
          {mapReady && weatherData && !isFetching && !fetchError && (
            <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap justify-center gap-2">
              <span className="text-[10px] bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-text-muted font-body-sans shadow-sm">
                🟢 {loadedCount}/{totalCities} kota — Klik marker untuk detail
              </span>
            </div>
          )}

          {/* Custom zoom buttons */}
          {mapReady && (
            <div className="absolute bottom-5 right-4 z-[1100] flex flex-col gap-[1px] leaflet-zoom-hide">
              <button onClick={handleZoomIn} aria-label="Perbesar peta" className="w-[46px] h-[46px] flex items-center justify-center bg-white rounded-t-[14px] text-[24px] font-bold text-[#0C4A6E] hover:bg-[#f0f9ff] hover:text-[#006591] active:bg-[#dbeafe] active:scale-[0.93] shadow-[0_3px_14px_rgba(0,0,0,0.18)] cursor-pointer select-none transition-all duration-100 border-0" style={{ borderBottom: '1px solid #e2e8f0', lineHeight: 1 }} type="button">+</button>
              <button onClick={handleZoomOut} aria-label="Perkecil peta" className="w-[46px] h-[46px] flex items-center justify-center bg-white rounded-b-[14px] text-[24px] font-bold text-[#0C4A6E] hover:bg-[#f0f9ff] hover:text-[#006591] active:bg-[#dbeafe] active:scale-[0.93] shadow-[0_3px_14px_rgba(0,0,0,0.18)] cursor-pointer select-none transition-all duration-100 border-0" style={{ lineHeight: 1 }} type="button">−</button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle indikator cuaca */}
      {mapReady && (
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            aria-label={showIndicators ? "Sembunyikan legenda cuaca" : "Tampilkan legenda cuaca"}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-outline-variant/40 shadow-sm text-[12px] font-body-sans text-text-dark hover:bg-surface-container-low transition-colors cursor-pointer"
            type="button"
          >
            <span>{showIndicators ? "👁️" : "👁️‍🗨️"}</span>
            <span>{showIndicators ? "Sembunyikan Legenda" : "Tampilkan Legenda"}</span>
          </button>
          {!showIndicators && <span className="text-[10px] text-text-muted font-body-sans">Legenda disembunyikan</span>}
        </div>
      )}

      {/* Mobile legend (below map) */}
      <div className="mt-3 md:hidden">
        <details className="text-[12px]">
          <summary className="cursor-pointer text-text-muted font-body-sans font-medium mb-2">Indikator Cuaca</summary>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {[
              { label: "Cerah", color: "#f59e0b" },
              { label: "Cerah Berawan", color: "#60a5fa" },
              { label: "Berawan", color: "#9ca3af" },
              { label: "Berawan Tebal", color: "#6b7280" },
              { label: "Hujan Ringan", color: "#818cf8" },
              { label: "Hujan Sedang", color: "#6366f1" },
              { label: "Hujan Lebat", color: "#4f46e5" },
              { label: "Hujan Petir", color: "#7c3aed" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 font-body-sans text-text-muted">
                <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </details>
      </div>

      {/* Footer attribution */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] md:text-[11px] text-text-muted font-body-sans">
          Data prakiraan cuaca dari BMKG — lingkaran berwarna menunjukkan kondisi cuaca terkini di setiap ibukota provinsi
        </p>
        <p className="text-[10px] md:text-[11px] text-text-muted font-body-sans">
          Sumber: <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer" className="text-primary-container hover:underline">data.bmkg.go.id</a>
        </p>
      </div>
    </div>
  );
}

/** Emoji fallback untuk cuaca (ketika ikon BMKG tidak tersedia) */
function getWeatherEmoji(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("cerah") && !d.includes("berawan")) return "☀️";
  if (d.includes("cerah berawan")) return "🌤️";
  if (d.includes("berawan tebal")) return "☁️";
  if (d.includes("berawan")) return "⛅";
  if (d.includes("hujan petir")) return "⛈️";
  if (d.includes("hujan lebat")) return "🌧️";
  if (d.includes("hujan")) return "🌦️";
  if (d.includes("kabut")) return "🌫️";
  return "🌤️";
}
