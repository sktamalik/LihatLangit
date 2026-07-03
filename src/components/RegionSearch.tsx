/**
 * Region search — large glass search bar per DESIGN.md.
 * Includes search icon, debounced input with keyboard nav,
 * floating glass result list, and "Gunakan lokasi" button.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Region } from "@/types/weather";

interface RegionSearchProps {
  onSelect: (region: Region) => void;
  onGeolocate: () => void;
  isGeolocating: boolean;
}

export default function RegionSearch({
  onSelect,
  onGeolocate,
  isGeolocating,
}: RegionSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Region[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/regions?q=${encodeURIComponent(q.trim())}`,
        { signal: controller.signal }
      );
      const data: Region[] = await res.json();
      setResults(data);
      setIsOpen(data.length > 0);
      setActiveIndex(-1);
    } catch {
      // Abort expected on new keystroke
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      selectResult(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const selectResult = (region: Region) => {
    setQuery(`${region.village}, ${region.district}, ${region.city}`);
    setIsOpen(false);
    setResults([]);
    onSelect(region);
  };

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!(target instanceof Element && target.closest('[data-search-root]'))) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div data-search-root className="relative w-full">
      {/* Large glass search bar per DESIGN.md */}
      <div className="glass-card rounded-xl flex items-center gap-3 px-5 py-3.5">
        {/* Search icon */}
        <svg
          className="w-5 h-5 text-text-muted shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Cari desa, kecamatan, kota..."
          className="flex-1 bg-transparent text-body-lg text-text-deep placeholder:text-text-muted/50 outline-none font-inter"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="region-results"
          aria-activedescendant={
            activeIndex >= 0 ? `region-${activeIndex}` : undefined
          }
        />

        {/* Searching spinner */}
        {isSearching && (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
        )}

        {/* Ghost button per DESIGN.md — border, rounded-lg */}
        <button
          onClick={onGeolocate}
          disabled={isGeolocating}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-primary/30 text-primary font-geist text-label-sm hover:bg-primary/5 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary shrink-0"
          aria-label="Gunakan lokasi saat ini"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            />
            <circle cx="12" cy="9" r="2.5" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">
            {isGeolocating ? "Mencari..." : "Gunakan lokasi"}
          </span>
        </button>
      </div>

      {/* Floating glass result list per DESIGN.md */}
      {isOpen && results.length > 0 && (
        <ul
          id="region-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 glass-card-elevated rounded-xl overflow-hidden z-50 max-h-80 overflow-y-auto animate-fade-in-up"
        >
          {results.map((region, index) => (
            <li
              key={region.adm4}
              id={`region-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectResult(region)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-5 py-3.5 cursor-pointer transition-colors border-b border-white/30 last:border-b-0 ${
                index === activeIndex
                  ? "bg-primary-container/15"
                  : "hover:bg-white/50"
              }`}
            >
              <p className="text-body-md font-semibold text-text-deep font-geist">
                {region.village}
              </p>
              <p className="text-label-sm text-text-muted font-geist mt-0.5">
                {region.district}, {region.city}, {region.province}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen && results.length === 0 && query.trim().length >= 2 && !isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card-elevated rounded-xl p-5 z-50 animate-fade-in-up text-center">
          <p className="text-body-md text-text-muted">
            Wilayah tidak ditemukan. Coba kata kunci lain.
          </p>
        </div>
      )}
    </div>
  );
}
