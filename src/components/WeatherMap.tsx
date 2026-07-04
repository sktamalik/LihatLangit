/**
 * Weather map — interactive Leaflet map.
 * Fixed: reliable init, proper cleanup, responsive sizing.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { WeatherForecast } from "@/types/weather";

interface WeatherMapProps {
  forecast: WeatherForecast;
}

export default function WeatherMap({ forecast }: WeatherMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const lat = forecast.region.latitude ?? -6.2;
  const lon = forecast.region.longitude ?? 106.8;

  useEffect(() => {
    let destroyed = false;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Fix Leaflet default icon path issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        if (destroyed || !mapContainer.current || mapInstance.current) return;

        const map = L.map(mapContainer.current, {
          center: [lat, lon],
          zoom: 10,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(
          `<div style="font-family:Geist,sans-serif;font-size:13px">
            <b>${forecast.region.village}</b><br/>
            ${forecast.region.district}, ${forecast.region.city}
          </div>`
        );

        const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
        const temp = pt?.temperatureC ?? 28;
        const color = temp > 32 ? "#f59e0b" : temp > 28 ? "#0ea5e9" : temp > 24 ? "#22c55e" : "#6366f1";

        L.circle([lat, lon], {
          radius: 5000,
          color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 2,
          opacity: 0.6,
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstance.current = map;

        // Force size recalculation after mount
        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 300);

        if (!destroyed) setMapReady(true);
      } catch (e) {
        console.error("Map init failed:", e);
        if (!destroyed) setLoadError(true);
      }
    };

    // Clean up previous map instance before re-initializing
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
      setMapReady(false);
    }

    initMap();

    return () => {
      destroyed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [lat, lon]); // Re-init when location changes

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-geist text-[18px] font-semibold text-primary">
          Peta Cuaca — {forecast.region.city}
        </h2>
        <div className="flex gap-1">
          <span className="px-3 py-1 bg-primary text-white rounded-full font-label-sm text-xs">Suhu</span>
        </div>
      </div>

      <div
        ref={mapContainer}
        className="w-full rounded-2xl border border-white/60 overflow-hidden bg-[#e8f4f8]"
        style={{ height: "280px", zIndex: 1 }}
      >
        {!mapReady && !loadError && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-text-muted font-geist">Memuat peta...</span>
            </div>
          </div>
        )}
        {loadError && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="flex items-center gap-1 text-text-muted"><span className="material-symbols-outlined text-[14px]">map</span> Peta tidak dapat dimuat</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-text-muted">
        <span className="bg-primary/10 px-2.5 py-1 rounded-full font-geist flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">location_on</span> {forecast.region.village}, {forecast.region.city}
        </span>
        <span className="bg-primary/10 px-2.5 py-1 rounded-full font-geist flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">thermostat</span> {forecast.nearestPoint?.temperatureC ?? "--"}°C
        </span>
        <span className="bg-primary/10 px-2.5 py-1 rounded-full font-geist flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">air</span> {forecast.nearestPoint?.windSpeedKmh ?? "--"} km/j
        </span>
        <span className="bg-primary/10 px-2.5 py-1 rounded-full font-geist flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">map</span> {lat.toFixed(2)}°S, {lon.toFixed(2)}°E
        </span>
      </div>
    </div>
  );
}
