/**
 * WarningBanner — peringatan dini BMKG data asli.
 * Tampilkan 3, filter provinsi, expand detail, "Lihat lainnya".
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import type { WarningItem, WarningDetail } from "@/app/api/warnings/route";

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateStr; }
}

export default function WarningBanner() {
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, WarningDetail>>({});
  const [filter, setFilter] = useState<string>("semua");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch("/api/warnings")
      .then((r) => r.json())
      .then((data) => { setWarnings(data.warnings ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const loadDetail = async (link: string) => {
    if (details[link]) return;
    setDetailLoading(link);
    try {
      const res = await fetch(`/api/warnings?detail=${encodeURIComponent(link)}`);
      const data = await res.json();
      if (data.headline) setDetails((p) => ({ ...p, [link]: data }));
    } catch { /* ignore */ }
    setDetailLoading(null);
  };

  // Extract unique provinces
  const provinces = useMemo(() => {
    const set = new Set<string>();
    warnings.forEach((w) => w.region && set.add(w.region));
    return ["semua", ...Array.from(set).sort()];
  }, [warnings]);

  const filtered = useMemo(() => {
    if (filter === "semua") return warnings;
    return warnings.filter((w) => w.region === filter);
  }, [warnings, filter]);

  const displayed = showAll ? filtered : filtered.slice(0, 2);

  if (loading || warnings.length === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200/60 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
        <span className="font-geist font-semibold text-sm text-red-700">
          Peringatan Dini Cuaca BMKG
        </span>
        <span className="text-[11px] text-red-500 font-geist">({filtered.length} wilayah)</span>

        {/* Filter provinsi */}
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setShowAll(false); }}
          className="ml-auto text-[11px] bg-white/80 border border-red-200 rounded-lg px-2 py-1 text-red-700 font-geist outline-none focus:ring-1 focus:ring-red-300"
        >
          {provinces.map((p) => (
            <option key={p} value={p}>{p === "semua" ? "Semua Provinsi" : p}</option>
          ))}
        </select>

        <a href="https://www.bmkg.go.id/alerts/nowcast/id" target="_blank" rel="noopener noreferrer"
          className="text-[11px] text-red-600 hover:underline font-geist shrink-0">
          Sumber ↗
        </a>
      </div>

      {/* Daftar */}
      <div className="px-4 pb-4 space-y-2">
        {displayed.map((w) => (
          <div key={w.link + w.region} className="bg-white/60 rounded-xl border border-red-100 overflow-hidden">
            <button
              onClick={() => { setExpanded(expanded === w.link ? null : w.link); loadDetail(w.link); }}
              className="w-full flex items-start gap-3 p-3 text-left hover:bg-white/40 transition-colors"
            >
              <span className="text-base mt-0.5">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-red-800">{w.region}</p>
                <p className="text-[11px] text-red-600 line-clamp-1">{w.title}</p>
                <p className="text-[10px] text-red-400 mt-0.5">{formatDate(w.pubDate)}</p>
              </div>
              <span className="material-symbols-outlined text-red-400 text-[18px] mt-1 transition-transform"
                style={{ transform: expanded === w.link ? "rotate(180deg)" : "" }}>
                expand_more
              </span>
            </button>

            {expanded === w.link && (
              <div className="px-3 pb-3 pt-0 border-t border-red-100">
                {detailLoading === w.link ? (
                  <p className="text-xs text-red-400 py-2">Memuat detail...</p>
                ) : details[w.link] ? (
                  <div className="text-[12px] text-red-700 space-y-2 pt-2">
                    <p><span className="font-semibold">Kejadian:</span> {details[w.link].event}</p>
                    <p><span className="font-semibold">Tingkat:</span> {details[w.link].severity} · {details[w.link].urgency} · {details[w.link].certainty}</p>
                    <p><span className="font-semibold">Wilayah:</span> {details[w.link].areaDesc}</p>
                    <p>{details[w.link].description}</p>
                    {details[w.link].effective && <p><span className="font-semibold">Mulai:</span> {formatDate(details[w.link].effective)}</p>}
                    {details[w.link].expires && <p><span className="font-semibold">Berakhir:</span> {formatDate(details[w.link].expires)}</p>}
                    {details[w.link].contact && <p><span className="font-semibold">Kontak:</span> {details[w.link].contact}</p>}
                    <div className="flex gap-2 pt-1">
                      <a href={w.link} target="_blank" rel="noopener noreferrer"
                        className="text-[11px] text-red-600 font-medium hover:underline">Detail CAP XML ↗</a>
                      {details[w.link].web && (
                        <a href={details[w.link].web} target="_blank" rel="noopener noreferrer"
                          className="text-[11px] text-red-600 font-medium hover:underline">Infografis ↗</a>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-red-400 py-2">Gagal memuat detail.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Tombol lihat lainnya */}
        {filtered.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full py-2 text-center text-[12px] text-red-600 font-geist font-medium hover:bg-white/40 rounded-xl transition-colors"
          >
            {showAll
              ? `Tampilkan lebih sedikit`
              : `+${filtered.length - 3} peringatan lainnya — Lihat semua`
            }
          </button>
        )}

        {/* Info jika filter tidak ada hasil */}
        {filtered.length === 0 && (
          <p className="text-center text-xs text-red-400 py-3 font-geist">
            Tidak ada peringatan aktif untuk {filter}.
          </p>
        )}
      </div>
    </div>
  );
}
