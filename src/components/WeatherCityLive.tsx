"use client";

import { useEffect, useState } from "react";
import type { WeatherForecast } from "@/types/weather";

/**
 * Widget cuaca live untuk halaman SEO kota (/cuaca/[slug]).
 * Fetch /api/weather (cache 5 menit + CDN) — data BMKG real-time
 * tanpa membebani render statis halaman.
 */
export default function WeatherCityLive({ adm4, city }: { adm4: string; city: string }) {
  const [data, setData] = useState<WeatherForecast | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/weather?adm4=${encodeURIComponent(adm4)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("http " + r.status))))
      .then((j: WeatherForecast) => {
        if (alive) {
          const err = (j as unknown as { error?: { message?: string } }).error;
          if (err) setError(err.message ?? "Data belum tersedia.");
          else setData(j);
        }
      })
      .catch(() => alive && setError("Gagal mengambil data cuaca."));
    return () => {
      alive = false;
    };
  }, [adm4]);

  if (error) {
    return (
      <div className="card-surface rounded-[16px] p-6 text-center">
        <p className="font-body-sans text-text-secondary">{error} Coba muat ulang halaman.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="card-surface rounded-[16px] p-6">
        <p className="font-body-sans text-text-secondary animate-pulse">Memuat cuaca {city} dari BMKG...</p>
      </div>
    );
  }

  const now = data.nearestPoint ?? data.days[0]?.points[0];
  return (
    <div className="card-surface rounded-[16px] p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="font-body-sans text-text-secondary text-sm">Suhu sekarang di {city}</p>
          <p className="font-body-sans text-[40px] font-bold text-text-primary">{now?.temperatureC ?? "--"}°C</p>
          <p className="font-body-sans text-text-primary">{now?.weatherDescription ?? "—"}</p>
        </div>
        <div className="ml-auto grid gap-2 text-sm font-body-sans text-text-secondary">
          <span>Kelembapan: {now?.humidityPct ?? "--"}%</span>
          <span>Angin: {now?.windSpeedKmh ?? "--"} km/jam</span>
          {data.fallbackFrom ? <span>Data wilayah terdekat: {data.fallbackFrom}</span> : null}
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {data.days.slice(0, 3).map((d) => {
          const t = d.points.map((p) => p.temperatureC).filter((x): x is number => x != null);
          const min = t.length ? Math.min(...t) : null;
          const max = t.length ? Math.max(...t) : null;
          return (
            <div key={d.date} className="rounded-[12px] bg-white border border-black/5 p-4">
              <p className="font-body-sans font-semibold text-text-primary">{d.label}</p>
              <p className="font-body-sans text-text-secondary text-sm">{d.points[0]?.weatherDescription ?? "—"}</p>
              <p className="font-body-sans font-bold text-text-primary">
                {min != null && max != null ? `${Math.round(min)}° – ${Math.round(max)}°` : "--°"}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs font-body-sans text-text-secondary">
        Data prakiraan cuaca {city} dari BMKG, diperbarui per 3 jam.
      </p>
    </div>
  );
}