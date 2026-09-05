"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import type { WarningItem } from "@/app/api/warnings/route";
import type { Region } from "@/types/weather";

export type MatchLevel = "district" | "city" | "province";

export interface MatchedWarning {
  warning: WarningItem;
  matchLevel: MatchLevel;
}

let cachedWarnings: WarningItem[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function cleanGeoName(str: string): string {
  return str
    .toLowerCase()
    .replace(/^(provinsi|prov\.|kota|kabupaten|kab\.|kecamatan|kec\.|desa|kelurahan|kel\.)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchWarningForRegion(
  warnings: WarningItem[],
  region?: Region | null
): MatchedWarning | null {
  if (!warnings || warnings.length === 0 || !region) return null;

  const provClean = cleanGeoName(region.province || "");
  const cityClean = cleanGeoName(region.city || "");
  const distClean = cleanGeoName(region.district || "");

  const provAliases: Record<string, string[]> = {
    "dki jakarta": ["jakarta"],
    "jakarta": ["dki jakarta"],
    "daerah khusus ibukota jakarta": ["jakarta", "dki jakarta"],
    "di yogyakarta": ["yogyakarta", "jogja"],
    "yogyakarta": ["di yogyakarta", "d.i. yogyakarta"],
    "daerah istimewa yogyakarta": ["yogyakarta", "di yogyakarta"],
    "kepulauan riau": ["kep. riau"],
    "kepulauan bangka belitung": ["bangka belitung", "babel"],
  };

  const provTargets = [provClean, ...(provAliases[provClean] || [])];

  // 1. High priority: District mentioned in description or title
  if (distClean.length >= 3) {
    const distMatch = warnings.find((w) => {
      const text = `${w.description} ${w.title}`.toLowerCase();
      return text.includes(distClean);
    });
    if (distMatch) return { warning: distMatch, matchLevel: "district" };
  }

  // 2. Medium priority: City/Regency mentioned in description or title
  if (cityClean.length >= 3) {
    const cityMatch = warnings.find((w) => {
      const text = `${w.description} ${w.title}`.toLowerCase();
      return text.includes(cityClean);
    });
    if (cityMatch) return { warning: cityMatch, matchLevel: "city" };
  }

  // 3. Province-level match
  if (provClean.length >= 3) {
    const provMatch = warnings.find((w) => {
      const wRegion = cleanGeoName(w.region || "");
      const fullText = `${w.title} ${w.description}`.toLowerCase();
      return provTargets.some(
        (target) =>
          target.length >= 3 &&
          (wRegion.includes(target) ||
            target.includes(wRegion) ||
            fullText.includes(target))
      );
    });
    if (provMatch) return { warning: provMatch, matchLevel: "province" };
  }

  return null;
}

export function useWarnings(region?: Region | null) {
  const [warnings, setWarnings] = useState<WarningItem[]>(() => cachedWarnings || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedWarnings);

  const fetchWarnings = useCallback(async () => {
    try {
      const res = await fetch("/api/warnings");
      if (res.ok) {
        const data = await res.json();
        const items = data.warnings ?? [];
        cachedWarnings = items;
        lastFetchTime = Date.now();
        setWarnings(items);
      }
    } catch {
      // ignore network errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const now = Date.now();
    if (!cachedWarnings || now - lastFetchTime >= CACHE_TTL_MS) {
      fetch("/api/warnings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data) return;
          const items = data.warnings ?? [];
          cachedWarnings = items;
          lastFetchTime = Date.now();
          setWarnings(items);
        })
        .catch(() => {})
        .finally(() => {
          if (active) setLoading(false);
        });
    }

    const interval = setInterval(() => {
      fetch("/api/warnings")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data) return;
          const items = data.warnings ?? [];
          cachedWarnings = items;
          lastFetchTime = Date.now();
          setWarnings(items);
        })
        .catch(() => {});
    }, CACHE_TTL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const matched = useMemo(() => {
    return matchWarningForRegion(warnings, region);
  }, [warnings, region]);

  return {
    warnings,
    loading,
    matchedWarning: matched,
    refetch: fetchWarnings,
  };
}
