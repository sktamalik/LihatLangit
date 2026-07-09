"use client";

import { useEffect, useRef, useState } from "react";
import { BmkgSkeleton, BmkgError } from "@/components/BmkgNewsCard";

interface BmkgItem {
  title: string;
  date: string;
  dateDisplay: string;
  image: string;
  url: string;
}

type TabType = "pengumuman" | "artikel";

const TABS: { key: TabType; label: string }[] = [
  { key: "pengumuman", label: "Pengumuman" },
  { key: "artikel", label: "Artikel" },
];

export default function BmkgInfoTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("pengumuman");
  const [data, setData] = useState<Record<TabType, BmkgItem[]>>({ pengumuman: [], artikel: [] });
  const [loading, setLoading] = useState<Record<TabType, boolean>>({ pengumuman: true, artikel: true });
  const [hasError, setHasError] = useState<Record<TabType, boolean>>({ pengumuman: false, artikel: false });
  const fetchedRef = useRef<Set<TabType>>(new Set());

  const fetchData = async (type: TabType) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    setHasError((prev) => ({ ...prev, [type]: false }));
    try {
      const res = await fetch(`/api/bmkg-content?type=${type}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (json.data?.length > 0) setData((prev) => ({ ...prev, [type]: json.data }));
    } catch {
      setHasError((prev) => ({ ...prev, [type]: true }));
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    if (!fetchedRef.current.has(activeTab)) {
      fetchedRef.current.add(activeTab);
      fetchData(activeTab);
    }
  }, [activeTab]);

  const currentData = data[activeTab];
  const isLoading = loading[activeTab];
  const error = hasError[activeTab];
  const isFirstLoad = isLoading && currentData.length === 0;
  const linkUrl = activeTab === "pengumuman" ? "https://www.bmkg.go.id/pengumuman" : "https://www.bmkg.go.id/artikel";
  const linkLabel = activeTab === "pengumuman" ? "Lihat semua pengumuman" : "Lihat semua artikel";

  const formatDate = (iso: string) => {
    if (!iso || iso.length < 10) return iso;
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const [, y, m, d] = iso.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
    if (!y) return iso;
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Header + Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark">
          Informasi BMKG
        </h3>
        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-0.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium font-body-sans transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? "bg-primary-container text-white shadow-sm"
                  : "text-text-muted hover:text-text-dark"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isFirstLoad && <BmkgSkeleton title="" />}
      {!isFirstLoad && error && currentData.length === 0 && (
        <BmkgError title="" onRetry={() => { fetchedRef.current.delete(activeTab); fetchData(activeTab); }} />
      )}
      {!isFirstLoad && currentData.length > 0 && (
        <>
          {/* Text-only list */}
          <div className="divide-y divide-gray-100">
            {currentData.slice(0, 6).map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors no-underline"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] sm:text-[15px] font-semibold text-text-dark font-body-sans leading-snug group-hover:text-primary-container transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <span className="mt-1.5 inline-block text-[11px] text-text-muted font-body-sans font-medium">
                    {item.dateDisplay || formatDate(item.date)}
                  </span>
                </div>
                <span className="shrink-0 mt-0.5 text-text-muted group-hover:text-primary-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-center">
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-container/30 text-primary-container text-[13px] font-medium font-body-sans hover:bg-primary-container/5 transition-colors no-underline"
            >
              {linkLabel}
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
