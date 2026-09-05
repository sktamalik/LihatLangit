"use client";
import { useEffect, useState } from "react";
import type { ErrorCode, Region } from "@/types/weather";

const ei: Record<string, string> = {
  BMKG_TIMEOUT: "wifi_off",
  BMKG_UNAVAILABLE: "cloud_off",
  BMKG_INVALID_RESPONSE: "warning",
  EMPTY_FORECAST: "inbox",
  INVALID_ADM4: "description",
  REGION_NOT_FOUND: "search_off",
  RATE_LIMITED: "sync",
};

export default function WeatherErrorState({
  code,
  message,
  onRetry,
  selectedRegion,
  onSelectRegion,
}: {
  code: ErrorCode;
  message: string;
  onRetry?: () => void;
  selectedRegion?: Region | null;
  onSelectRegion?: (region: Region) => void;
}) {
  const [nearbyRegions, setNearbyRegions] = useState<Region[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);

  useEffect(() => {
    if (!selectedRegion?.adm4 || (code !== "BMKG_UNAVAILABLE" && code !== "EMPTY_FORECAST")) {
      setNearbyRegions([]);
      return;
    }

    let active = true;
    setLoadingNearby(true);
    fetch(`/api/regions?fallbackFor=${encodeURIComponent(selectedRegion.adm4)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Region[]) => {
        if (active && Array.isArray(data)) {
          setNearbyRegions(data);
        }
      })
      .catch(() => {
        if (active) setNearbyRegions([]);
      })
      .finally(() => {
        if (active) setLoadingNearby(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRegion?.adm4, code]);

  return (
    <div className="card-surface rounded-[12px] p-6 md:p-8 flex flex-col items-center text-center animate-fade-in-up">
      <span className="material-symbols-outlined text-[48px] text-primary mb-3">
        {ei[code] ?? "warning"}
      </span>
      <h3 className="font-body-sans text-[20px] font-semibold text-text-primary mb-2">
        {code === "BMKG_TIMEOUT" && "Koneksi Terputus"}
        {code === "BMKG_UNAVAILABLE" && "Data Belum Tersedia di BMKG"}
        {code === "EMPTY_FORECAST" && "Data BMKG Kosong"}
        {!["BMKG_TIMEOUT", "BMKG_UNAVAILABLE", "EMPTY_FORECAST"].includes(code) && "Terjadi Kesalahan"}
      </h3>
      <p className="text-text-secondary max-w-md mb-6 font-body-sans text-[14px] leading-relaxed">
        {selectedRegion ? (
          <>
            Stasiun BMKG saat ini belum mempublikasikan data untuk{" "}
            <strong>{selectedRegion.village}, {selectedRegion.district}</strong>.
          </>
        ) : (
          message || "Data prakiraan cuaca untuk wilayah ini belum tersedia di BMKG."
        )}
      </p>

      {/* Wilayah terdekat yang datanya siap */}
      {nearbyRegions.length > 0 && onSelectRegion && (
        <div className="w-full max-w-md mb-6 bg-surface-container-low/60 border border-outline/15 rounded-xl p-4 text-left">
          <p className="font-body-sans text-[13px] font-semibold text-text-dark flex items-center gap-1.5 mb-2.5">
            <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
            Lihat cuaca wilayah terdekat dengan data lengkap:
          </p>
          <div className="flex flex-col gap-2">
            {nearbyRegions.map((reg) => (
              <button
                key={reg.adm4}
                onClick={() => onSelectRegion(reg)}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-primary/10 border border-outline/10 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <div className="font-body-sans text-[13px] font-semibold text-text-dark group-hover:text-primary">
                    {reg.village}, {reg.district}
                  </div>
                  <div className="font-body-sans text-[11px] text-text-muted">
                    {reg.city}, {reg.province}
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary text-[18px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loadingNearby && (
        <p className="text-[12px] font-body-sans text-text-muted mb-4 animate-pulse">
          Mencari wilayah terdekat dengan data BMKG aktif...
        </p>
      )}

      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2 bg-primary text-white rounded-md font-body-sans text-sm font-semibold hover:bg-primary/90 transition-transform hover:scale-[1.02] cursor-pointer"
          >
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}
