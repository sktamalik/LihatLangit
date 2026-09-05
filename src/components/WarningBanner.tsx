"use client";
import { useState, useMemo } from "react";
import type { WarningDetail } from "@/app/api/warnings/route";
import type { Region } from "@/types/weather";
import { formatDateTimeShort } from "@/lib/time";
import { useWarnings } from "@/lib/useWarnings";

export default function WarningBanner({ selectedRegion }: { selectedRegion?: Region | null }) {
  const { warnings, loading, matchedWarning } = useWarnings(selectedRegion);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, WarningDetail>>({});
  const [filter, setFilter] = useState<string>("semua");
  const [showAll, setShowAll] = useState(false);

  const loadDetail = async (link: string) => {
    if (details[link]) return;
    setDetailLoading(link);
    try { const res = await fetch(`/api/warnings?detail=${encodeURIComponent(link)}`); const data = await res.json(); if (data.headline) setDetails((p) => ({ ...p, [link]: data })); } catch {}
    setDetailLoading(null);
  };

  const provinces = useMemo(() => { const set = new Set<string>(); warnings.forEach((w) => w.region && set.add(w.region)); return ["semua", ...Array.from(set).sort()]; }, [warnings]);
  const filtered = useMemo(() => filter === "semua" ? warnings : warnings.filter((w) => w.region === filter), [warnings, filter]);
  const displayed = showAll ? filtered : filtered.slice(0, 2);

  if (loading || warnings.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 md:mb-6">
        <h3 className="font-body-sans text-[16px] md:text-[20px] font-semibold text-text-dark flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft shrink-0" />
          <span className="truncate">Peringatan Dini Cuaca BMKG</span>
        </h3>
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-[12px] font-body-sans text-on-surface-variant font-medium flex-wrap">
          <span className="text-[11px] sm:text-[12px] text-red-500 font-body-sans whitespace-nowrap">({filtered.length} wilayah)</span>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setShowAll(false); }} className="text-[11px] sm:text-[12px] bg-white rounded-lg px-2 py-1 text-text-dark font-body-sans outline-none border border-outline-variant/30 max-w-[130px] sm:max-w-none truncate">
            {provinces.map((p) => (<option key={p} value={p}>{p === "semua" ? "Semua Provinsi" : p}</option>))}
          </select>
          <a href="https://www.bmkg.go.id/alerts/nowcast/id" target="_blank" rel="noopener noreferrer" className="text-[11px] sm:text-[12px] text-primary-container hover:underline font-body-sans shrink-0 whitespace-nowrap">Sumber ↗</a>
        </div>
      </div>

      {/* Notifikasi Peringatan untuk Wilayah Aktif */}
      {matchedWarning && (
        <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-950 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">my_location</span>
            <span className="leading-snug">
              Peringatan cuaca aktif terdeteksi untuk wilayah Anda: <strong>{matchedWarning.warning.region}</strong> ({matchedWarning.matchLevel === "district" ? "Kecamatan" : matchedWarning.matchLevel === "city" ? "Kota/Kab" : "Provinsi"}).
            </span>
          </div>
          {filter !== matchedWarning.warning.region && (
            <button
              onClick={() => {
                setFilter(matchedWarning.warning.region);
                setExpanded(matchedWarning.warning.link);
                loadDetail(matchedWarning.warning.link);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 font-semibold shrink-0 cursor-pointer transition-colors"
            >
              Tampilkan Wilayah Ini
            </button>
          )}
        </div>
      )}

      <div className="space-y-2">
        {displayed.map((w) => (
          <div key={w.link + w.region} className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <button onClick={() => { setExpanded(expanded === w.link ? null : w.link); loadDetail(w.link); }} className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-dark">{w.region}</p>
                <p className="text-[11px] text-on-surface-variant line-clamp-1">{w.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{formatDateTimeShort(w.pubDate)}</p>
              </div>
              <span className="material-symbols-outlined text-text-muted text-[18px] mt-1 transition-transform" style={{ transform: expanded === w.link ? "rotate(180deg)" : "" }}>expand_more</span>
            </button>
            {expanded === w.link && (
              <div className="px-4 pb-4 pt-0">
                {detailLoading === w.link ? <p className="text-xs text-text-muted py-2">Memuat detail...</p> :
                 details[w.link] ? (
                  <div className="text-[12px] text-text-dark space-y-2 pt-2">
                    <p><span className="font-semibold">Kejadian:</span> {details[w.link].event}</p>
                    <p><span className="font-semibold">Tingkat:</span> {details[w.link].severity} · {details[w.link].urgency} · {details[w.link].certainty}</p>
                    <p><span className="font-semibold">Wilayah:</span> {details[w.link].areaDesc}</p>
                    <p>{details[w.link].description}</p>
                    {details[w.link].effective && <p><span className="font-semibold">Mulai:</span> {formatDateTimeShort(details[w.link].effective)}</p>}
                    {details[w.link].expires && <p><span className="font-semibold">Berakhir:</span> {formatDateTimeShort(details[w.link].expires)}</p>}
                  </div>
                ) : <p className="text-xs text-text-muted py-2">Gagal memuat detail.</p>}
              </div>
            )}
          </div>
        ))}
        {filtered.length > 2 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-center text-[12px] text-primary-container font-body-sans font-medium hover:bg-surface-container-low rounded-xl transition-colors">
            {showAll ? "Tampilkan lebih sedikit" : `+${filtered.length - 2} peringatan lainnya — Lihat semua`}
          </button>
        )}
        {filtered.length === 0 && <p className="text-center text-xs text-text-muted py-3 font-body-sans">Tidak ada peringatan aktif untuk {filter}.</p>}
      </div>
    </div>
  );
}
