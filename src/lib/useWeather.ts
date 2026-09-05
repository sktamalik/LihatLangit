"use client";

/**
 * Hook for fetching weather data and managing dashboard state.
 * Auto-loads Makassar on mount. Background-refreshes every 30 min.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type { Region, WeatherForecast, ApiError } from "@/types/weather";

export type DashboardState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; forecast: WeatherForecast }
  | { status: "error"; error: ApiError["error"] }
  | { status: "geolocating" }
  | { status: "geo-denied" }
  | { status: "geo-unavailable" }
  | { status: "geo-no-match" };

const DEFAULT_REGION: Region = {
  adm4: "73.71.01.0005", province: "SULAWESI SELATAN", city: "KOTA MAKASSAR",
  district: "MARISO", village: "MARISO",
  latitude: -5.14, longitude: 119.41,
  timezone: "Asia/Makassar",
};

/** BMKG updates roughly every 3-6 hours; 30 min refresh keeps data fresh */
const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function useWeather() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(DEFAULT_REGION);
  const abortRef = useRef<AbortController | null>(null);
  const initialFetchDone = useRef(false);
  const currentAdm4Ref = useRef<string | null>(DEFAULT_REGION.adm4);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchWeather = useCallback(async (adm4: string, silent = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    if (!silent) setState({ status: "loading" });

    try {
      const res = await fetch(`/api/weather?adm4=${encodeURIComponent(adm4)}`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if ("error" in data) {
        // Silent refresh — keep current state, don't show error
        if (silent) return;
        setState({ status: "error", error: data.error as ApiError["error"] });
        return;
      }
      setState({ status: "ready", forecast: data as WeatherForecast });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Silent refresh — keep stale data instead of flashing error
      if (silent) return;
      setState({ status: "error", error: { code: "BMKG_UNAVAILABLE", message: "Gagal mengambil data." } });
    }
  }, []);

  // ── Background refresh — every 30 min for current region ──
  useEffect(() => {
    if (refreshTimerRef.current) return; // only set up once
    refreshTimerRef.current = setInterval(() => {
      const adm4 = currentAdm4Ref.current ?? DEFAULT_REGION.adm4;
      fetchWeather(adm4, true);
    }, REFRESH_INTERVAL_MS);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchWeather]);

  // Auto-load: periksa query param (?adm4=... atau ?q=...) di URL terlebih dahulu, fallback ke Makassar
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const paramAdm4 = params.get("adm4");
        const paramQ = params.get("q");

        if (paramAdm4) {
          fetch(`/api/regions?adm4=${encodeURIComponent(paramAdm4)}`)
            .then((res) => (res.ok ? res.json() : null))
            .then((reg: Region | null) => {
              if (reg && reg.adm4) {
                currentAdm4Ref.current = reg.adm4;
                setSelectedRegion(reg);
                fetchWeather(reg.adm4);
                return;
              }
              // Jika fetch region gagal, coba langsung fetchWeather dengan adm4
              currentAdm4Ref.current = paramAdm4;
              fetchWeather(paramAdm4);
            })
            .catch(() => {
              currentAdm4Ref.current = paramAdm4;
              fetchWeather(paramAdm4);
            });
          return;
        }

        if (paramQ) {
          fetch(`/api/regions?q=${encodeURIComponent(paramQ)}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((regions: Region[]) => {
              if (Array.isArray(regions) && regions.length > 0) {
                const first = regions[0];
                currentAdm4Ref.current = first.adm4;
                setSelectedRegion(first);
                fetchWeather(first.adm4);
                return;
              }
              // Fallback jika q tidak menghasilkan apa pun
              currentAdm4Ref.current = DEFAULT_REGION.adm4;
              setSelectedRegion(DEFAULT_REGION);
              fetchWeather(DEFAULT_REGION.adm4);
            })
            .catch(() => {
              currentAdm4Ref.current = DEFAULT_REGION.adm4;
              setSelectedRegion(DEFAULT_REGION);
              fetchWeather(DEFAULT_REGION.adm4);
            });
          return;
        }
      }

      currentAdm4Ref.current = DEFAULT_REGION.adm4;
      queueMicrotask(() => {
        fetchWeather(DEFAULT_REGION.adm4);
      });
    }
  }, [fetchWeather]);

  const searchAndSelect = useCallback(async (region: Region) => {
    currentAdm4Ref.current = region.adm4;
    setSelectedRegion(region);

    // Sync query param ke URL secara silent tanpa full reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("adm4", region.adm4);
      url.searchParams.delete("q");
      window.history.replaceState({}, "", url.toString());
    }

    await fetchWeather(region.adm4);
  }, [fetchWeather]);

  const retry = useCallback(() => {
    if (selectedRegion) fetchWeather(selectedRegion.adm4);
  }, [selectedRegion, fetchWeather]);

  const requestGeolocation = useCallback(async () => {
    if (!navigator.geolocation) { setState({ status: "geo-unavailable" }); return; }
    setState({ status: "geolocating" });
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`/api/regions?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          if (!res.ok) { setState({ status: "geo-no-match" }); return; }
          const region: Region = await res.json();
          if (!region || !region.adm4) { setState({ status: "geo-no-match" }); return; }
          currentAdm4Ref.current = region.adm4;
          setSelectedRegion(region);
          await fetchWeather(region.adm4);
        } catch { setState({ status: "geo-unavailable" }); }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setState({ status: "geo-denied" });
        else setState({ status: "geo-unavailable" });
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [fetchWeather]);

  return { state, selectedRegion, searchAndSelect, retry, requestGeolocation };
}
