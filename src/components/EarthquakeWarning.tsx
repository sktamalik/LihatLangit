"use client";

import { useEffect, useState, useCallback } from "react";

interface GempaEntry {
  tanggal: string;
  jam: string;
  magnitude: string;
  kedalaman: string;
  wilayah: string;
  potensi: string;
  coordinates: string;
  lintang: string;
  bujur: string;
}

function magnitudeColor(mag: number): string {
  if (mag >= 6) return "bg-red-500 text-white";
  if (mag >= 5) return "bg-orange-500 text-white";
  if (mag >= 4) return "bg-yellow-500 text-black";
  return "bg-green-500 text-white";
}

function magnitudeLabel(mag: number): string {
  if (mag >= 6) return "Kuat";
  if (mag >= 5) return "Sedang";
  if (mag >= 4) return "Ringan";
  return "Minor";
}

function depthLabel(km: number): string {
  if (km >= 300) return "Dalam";
  if (km >= 60) return "Menengah";
  return "Dangkal";
}

function tsunamiBadge(potensi: string): string {
  const t = potensi.toLowerCase();
  if (t.includes("tsunami") || t.includes("berpotensi")) return "⚠️ Berpotensi Tsunami";
  return "✅ Tidak berpotensi tsunami";
}

function tsunamiColor(potensi: string): string {
  const t = potensi.toLowerCase();
  if (t.includes("tsunami") || t.includes("berpotensi")) return "bg-red-100 text-red-700 border-red-200";
  return "bg-green-100 text-green-700 border-green-200";
}

export default function EarthquakeWarning() {
  const [gempa, setGempa] = useState<GempaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGempa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gempa");
      const data = await res.json();
      if (data.error) {
        setError(data.error.message);
      } else {
        setGempa(data.gempa ?? []);
      }
    } catch {
      setError("Gagal mengambil data gempa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGempa();
    const interval = setInterval(fetchGempa, 5 * 60 * 1000); // refresh setiap 5 menit
    return () => clearInterval(interval);
  }, [fetchGempa]);

  if (loading && gempa.length === 0) {
    return (
      <section id="gempa-bumi" className="w-full bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-500 text-[28px]">landslide</span>
          <h3 className="font-body-sans text-[18px] font-bold text-text-dark">Info Gempa Bumi Terkini</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
        </div>
      </section>
    );
  }

  if (error && gempa.length === 0) {
    return (
      <section id="gempa-bumi" className="w-full bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-red-500 text-[28px]">landslide</span>
          <h3 className="font-body-sans text-[18px] font-bold text-text-dark">Info Gempa Bumi Terkini</h3>
        </div>
        <p className="text-red-500 text-[14px]">{error}</p>
      </section>
    );
  }

  return (
    <section id="gempa-bumi" className="w-full bg-white rounded-xl p-5 md:p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[26px] md:text-[28px]">landslide</span>
          <div>
            <h3 className="font-body-sans text-[16px] md:text-[18px] font-bold text-text-dark">Info Gempa Bumi Terkini</h3>
            <p className="font-body-sans text-[11px] md:text-[12px] text-on-surface-variant">Sumber: BMKG — DataMKG/TEWS</p>
          </div>
        </div>
        <button
          onClick={fetchGempa}
          disabled={loading}
          className="text-xs text-primary-container hover:text-primary font-medium flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          {loading ? "Memuat..." : "Refresh"}
        </button>
      </div>

      {/* List gempa */}
      {gempa.length === 0 ? (
        <p className="text-on-surface-variant text-[14px] italic">Belum ada data gempa terkini.</p>
      ) : (
        <div className="space-y-3">
          {gempa.slice(0, 5).map((g, idx) => {
            const mag = parseFloat(g.magnitude) || 0;
            const depth = parseInt(g.kedalaman) || 0;
            return (
              <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: magnitude badge */}
                  <div className="flex items-start gap-3 flex-shrink-0">
                    <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg ${magnitudeColor(mag)}`}>
                      <span className="font-body-sans text-[20px] font-bold leading-none">{g.magnitude}</span>
                      <span className="text-[9px] font-medium opacity-80 leading-tight">SR</span>
                    </div>
                  </div>
                  {/* Middle: location + details */}
                  <div className="flex-grow min-w-0">
                    <p className="font-body-sans text-[14px] font-semibold text-text-dark mb-1 line-clamp-2">{g.wilayah}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                      <span>{g.tanggal} · {g.jam}</span>
                      <span>Kedalaman: {g.kedalaman} ({depthLabel(depth)})</span>
                      <span>Koordinat: {g.lintang}, {g.bujur}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">{magnitudeLabel(mag)}</span>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${tsunamiColor(g.potensi)}`}>
                        {tsunamiBadge(g.potensi)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <p className="text-[11px] text-on-surface-variant">
          Menampilkan {Math.min(gempa.length, 5)} dari {gempa.length} gempa terkini
        </p>
        <a
          href="https://www.bmkg.go.id/gempabumi-terkini.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-primary-container hover:text-primary font-medium flex items-center gap-1 no-underline"
        >
          Lihat Detail BMKG
          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </section>
  );
}
