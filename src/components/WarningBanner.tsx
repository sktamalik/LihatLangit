"use client";
import { useEffect, useState, useMemo } from "react";
import type { WarningItem, WarningDetail } from "@/app/api/warnings/route";
import { formatDateTimeShort } from "@/lib/time";

function formatDate(dateStr: string): string { return formatDateTimeShort(dateStr); }

export default function WarningBanner() {
  const [warnings, setWarnings] = useState<WarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, WarningDetail>>({});
  const [filter, setFilter] = useState<string>("semua");
  const [showAll, setShowAll] = useState(false);

  const fetchWarnings = () => {
    fetch("/api/warnings").then((r) => r.json()).then((data) => { setWarnings(data.warnings ?? []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWarnings();
    const timer = setInterval(fetchWarnings, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(timer);
  }, []);

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
    <div className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
          Peringatan Dini Cuaca BMKG
        </h3>
        <div className="flex items-center gap-4 text-[12px] font-body-sans text-on-surface-variant font-medium">
          <span className="text-[11px] text-red-500 font-body-sans">({filtered.length} wilayah)</span>
          <select value={filter} onChange={(e) => { setFilter(e.target.value); setShowAll(false); }} className="text-[11px] bg-white rounded-lg px-2 py-1 text-text-dark font-body-sans outline-none">
            {provinces.map((p) => (<option key={p} value={p}>{p === "semua" ? "Semua Provinsi" : p}</option>))}
          </select>
          <a href="https://www.bmkg.go.id/alerts/nowcast/id" target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary-container hover:underline font-body-sans shrink-0">Sumber ↗</a>
        </div>
      </div>

      <div className="space-y-2">
        {displayed.map((w) => (
          <div key={w.link + w.region} className="bg-surface-container-lowest rounded-xl overflow-hidden">
            <button onClick={() => { setExpanded(expanded === w.link ? null : w.link); loadDetail(w.link); }} className="w-full flex items-start gap-3 p-4 text-left hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-dark">{w.region}</p>
                <p className="text-[11px] text-on-surface-variant line-clamp-1">{w.title}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{formatDate(w.pubDate)}</p>
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
                    {details[w.link].effective && <p><span className="font-semibold">Mulai:</span> {formatDate(details[w.link].effective)}</p>}
                    {details[w.link].expires && <p><span className="font-semibold">Berakhir:</span> {formatDate(details[w.link].expires)}</p>}
                  </div>
                ) : <p className="text-xs text-text-muted py-2">Gagal memuat detail.</p>}
              </div>
            )}
          </div>
        ))}
        {filtered.length > 2 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full py-2 text-center text-[12px] text-primary-container font-body-sans font-medium hover:bg-surface-container-low rounded-xl transition-colors">
            {showAll ? "Tampilkan lebih sedikit" : `+${filtered.length - 3} peringatan lainnya — Lihat semua`}
          </button>
        )}
        {filtered.length === 0 && <p className="text-center text-xs text-text-muted py-3 font-body-sans">Tidak ada peringatan aktif untuk {filter}.</p>}
      </div>
    </div>
  );
}
