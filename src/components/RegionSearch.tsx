/**
 * Region search — type to search, select from dropdown, submit via button.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Region } from "@/types/weather";

interface RegionSearchProps {
  onSelect: (region: Region) => void;
}

export default function RegionSearch({ onSelect }: RegionSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Region[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingRegion, setPendingRegion] = useState<Region | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setIsOpen(false); return; }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch(`/api/regions?q=${encodeURIComponent(q.trim())}`, { signal: controller.signal });
      const data: Region[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

  const commitRegion = (region: Region) => {
    setQuery(`${region.village}, ${region.district}`);
    setIsOpen(false);
    setResults([]);
    setPendingRegion(null);
    onSelect(region);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((p) => (p < results.length - 1 ? p + 1 : 0)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((p) => (p > 0 ? p - 1 : results.length - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) commitRegion(results[activeIndex]);
      else if (pendingRegion) commitRegion(pendingRegion);
    }
    else if (e.key === "Escape") { setIsOpen(false); inputRef.current?.blur(); }
  };

  const selectFromDropdown = (region: Region) => {
    setQuery(`${region.village}, ${region.district}`);
    setIsOpen(false);
    setResults([]);
    setPendingRegion(region);
    inputRef.current?.focus();
  };

  const handleSearchClick = () => {
    if (pendingRegion) {
      commitRegion(pendingRegion);
    } else if (results.length > 0) {
      commitRegion(results[0]);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Element && e.target.closest('[data-search-root]'))) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div data-search-root className="relative flex-1 flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPendingRegion(null); }}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        placeholder="Cari Desa atau Kecamatan..."
        className="bg-transparent border-none focus:ring-0 w-full text-body-md text-on-surface placeholder-outline/70 outline-none flex-1"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="region-search-results"
        aria-autocomplete="list"
      />
      <button
        onClick={handleSearchClick}
        disabled={!pendingRegion && results.length === 0}
        className="shrink-0 p-2.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Cari cuaca"
      >
        <span className="material-symbols-outlined text-[20px]">search</span>
      </button>

      {isOpen && results.length > 0 && (
        <ul id="region-search-results" className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl overflow-hidden z-[9999] max-h-64 overflow-y-auto shadow-[0_8px_30px_rgba(0,0,0,0.12)] animate-fade-in-up" role="listbox">
          {results.map((region, index) => (
            <li
              key={region.adm4}
              onClick={() => selectFromDropdown(region)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-white/30 last:border-b-0 ${
                index === activeIndex ? "bg-primary-container/15" : "hover:bg-white/50"
              }`}
            >
              <p className="text-sm font-semibold text-text-deep font-geist">{region.village}</p>
              <p className="text-xs text-text-muted font-geist">{region.district}, {region.city}, {region.province}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
