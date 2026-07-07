"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import type { WeatherForecast } from "@/types/weather";
import type { Map as LeafletMap, Marker, Circle } from "leaflet";

export default function WeatherMap({ forecast }: { forecast: WeatherForecast }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const lat = forecast.region.latitude ?? -5.14;
  const lon = forecast.region.longitude ?? 119.41;
  const village = forecast.region.village;
  const district = forecast.region.district;
  const city = forecast.region.city;
  const pt = useMemo(() => forecast.nearestPoint ?? forecast.days[0]?.points[0], [forecast.nearestPoint, forecast.days]);
  const temp = pt?.temperatureC ?? 28;

  // ── Init map once ──
  useEffect(() => {
    let destroyed = false;
    const initMap = async () => {
      try {
        const LModule = await import("leaflet");
        const L = LModule.default;
        LRef.current = L;
        delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        if (destroyed || !mapContainer.current || mapInstance.current) return;
        const map = L.map(mapContainer.current, { center: [lat, lon], zoom: 10, zoomControl: false, attributionControl: false, scrollWheelZoom: false });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        L.control.zoom({ position: "bottomright" }).addTo(map);
        mapInstance.current = map;
        requestAnimationFrame(() => map.invalidateSize());
        setTimeout(() => map.invalidateSize(), 300);
        if (!destroyed) setMapReady(true);
      } catch { if (!destroyed) setLoadError(true); }
    };
    initMap();
    return () => { destroyed = true; if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update marker, popup & circle when data changes ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current || !LRef.current) return;
    const L = LRef.current;

    // Remove old layers
    if (markerRef.current) { mapInstance.current.removeLayer(markerRef.current); markerRef.current = null; }
    if (circleRef.current) { mapInstance.current.removeLayer(circleRef.current); circleRef.current = null; }

    // Add new marker
    const marker = L.marker([lat, lon]).addTo(mapInstance.current);
    marker.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px"><b>${village}</b><br/>${district}, ${city}</div>`);
    markerRef.current = marker;

    // Add new circle (color based on temp)
    const color = temp > 32 ? "#f59e0b" : temp > 28 ? "#0ea5e9" : temp > 24 ? "#22c55e" : "#6366f1";
    const circle = L.circle([lat, lon], { radius: 5000, color, fillColor: color, fillOpacity: 0.15, weight: 2, opacity: 0.6 }).addTo(mapInstance.current);
    circleRef.current = circle;
  }, [mapReady, lat, lon, village, district, city, temp]);

  return (
    <div className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark">Peta Cuaca — {city}</h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-grass-green/10 border border-grass-green/20">
          <span className="w-2 h-2 rounded-full bg-grass-green animate-pulse" />
          <span className="text-[12px] font-bold text-grass-green font-body-sans">{village}</span>
        </div>
      </div>
      <div ref={mapContainer} className="w-full h-[450px] rounded-lg overflow-hidden bg-background-sky/30 border border-outline-variant/30">
        {!mapReady && !loadError && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sm text-text-muted font-body-sans">Memuat peta...</span>
          </div>
        )}
        {loadError && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="flex items-center gap-1 text-text-muted font-body-sans"><span className="material-symbols-outlined text-[14px]">map</span> Peta tidak dapat dimuat</span>
          </div>
        )}
      </div>
    </div>
  );
}
