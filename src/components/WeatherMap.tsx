/**
 * Weather map — interactive Leaflet map showing region + weather overlay.
 * Falls back to an SVG illustration when API key unavailable.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { WeatherForecast } from "@/types/weather";

interface WeatherMapProps {
  forecast: WeatherForecast;
}

export default function WeatherMap({ forecast }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState<"hujan" | "awan" | "suhu">("hujan");
  const lat = forecast.region.latitude ?? -6.2;
  const lon = forecast.region.longitude ?? 106.8;

  useEffect(() => {
    // Dynamic import of Leaflet (client-side only)
    let map: any = null;
    let L: any = null;

    import("leaflet").then((leaflet) => {
      L = leaflet.default;
      if (!mapContainer.current || map) return;

      // Fix Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(mapContainer.current, {
        center: [lat, lon],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Marker
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${forecast.region.village}</b><br/>${forecast.region.city}`)
        .openPopup();

      // Simple weather overlay circles
      const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
      const temp = pt?.temperatureC ?? 28;
      L.circle([lat, lon], {
        radius: 3000,
        color: temp > 30 ? "#f59e0b" : temp > 25 ? "#0ea5e9" : "#6366f1",
        fillColor: temp > 30 ? "#f59e0b" : temp > 25 ? "#0ea5e9" : "#6366f1",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);

      // Zoom controls
      L.control.zoom({ position: "bottomright" }).addTo(map);

      setMapReady(true);
    });

    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [lat, lon, forecast.region.village, forecast.region.city, forecast]);

  return (
    <div className="glass-panel rounded-3xl p-card-padding sky-shadow flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-geist text-[20px] font-semibold text-primary">
          Peta Cuaca — {forecast.region.city}
        </h2>
        <div className="flex gap-2">
          {[
            { key: "hujan" as const, label: "Suhu" },
            { key: "awan" as const, label: "Awan" },
            { key: "suhu" as const, label: "Marker" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setViewMode(b.key)}
              className={`px-3 py-1 rounded-full font-label-sm text-xs transition-colors ${
                viewMode === b.key
                  ? "bg-primary text-white"
                  : "bg-white border border-outline/30 text-outline hover:bg-surface-container-low"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
      <div
        ref={mapContainer}
        className="w-full rounded-2xl border border-white/60 overflow-hidden relative"
        style={{ height: "280px", zIndex: 1 }}
      >
        {!mapReady && (
          <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
            <span className="text-outline/50">Memuat peta...</span>
          </div>
        )}
      </div>
      {!mapReady && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
          <span className="bg-primary/10 px-2 py-1 rounded">📍 {forecast.region.village}</span>
          <span className="bg-primary/10 px-2 py-1 rounded">🌡️ {forecast.nearestPoint?.temperatureC ?? "--"}°C</span>
          <span className="bg-primary/10 px-2 py-1 rounded">💨 {forecast.nearestPoint?.windSpeedKmh ?? "--"} km/j</span>
        </div>
      )}
    </div>
  );
}
