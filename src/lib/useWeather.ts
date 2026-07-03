/**
 * Hook for fetching weather data and managing dashboard state.
 * On first mount, auto-loads Makassar (Mariso) as default region.
 */

"use client";

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

/** Default region: Makassar (Mariso) */
const DEFAULT_REGION: Region = {
  adm4: "73.71.01.1001",
  province: "Sulawesi Selatan",
  city: "Makassar",
  district: "Mariso",
  village: "Mariso",
  latitude: -5.15,
  longitude: 119.407,
  timezone: "Asia/Makassar",
};

export function useWeather() {
  const [state, setState] = useState<DashboardState>({ status: "loading" });
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialFetchDone = useRef(false);

  const fetchWeather = useCallback(async (adm4: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ status: "loading" });

    try {
      const res = await fetch(`/api/weather?adm4=${encodeURIComponent(adm4)}`, {
        signal: controller.signal,
      });

      const data = await res.json();

      if ("error" in data) {
        setState({ status: "error", error: data.error as ApiError["error"] });
        return;
      }

      setState({ status: "ready", forecast: data as WeatherForecast });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({
        status: "error",
        error: {
          code: "BMKG_UNAVAILABLE",
          message: "Gagal mengambil data. Periksa koneksi Anda.",
        },
      });
    }
  }, []);

  // Auto-fetch default Makassar data on first mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      setSelectedRegion(DEFAULT_REGION);
      fetchWeather(DEFAULT_REGION.adm4);
    }
  }, [fetchWeather]);

  const searchAndSelect = useCallback(
    async (region: Region) => {
      setSelectedRegion(region);
      await fetchWeather(region.adm4);
    },
    [fetchWeather]
  );

  const retry = useCallback(() => {
    if (selectedRegion) {
      fetchWeather(selectedRegion.adm4);
    }
  }, [selectedRegion, fetchWeather]);

  const requestGeolocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState({ status: "geo-unavailable" });
      return;
    }

    setState({ status: "geolocating" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(
            `/api/regions?lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );

          if (!res.ok) {
            setState({ status: "geo-no-match" });
            return;
          }

          const region: Region = await res.json();
          if (!region || !region.adm4) {
            setState({ status: "geo-no-match" });
            return;
          }

          setSelectedRegion(region);
          await fetchWeather(region.adm4);
        } catch {
          setState({ status: "geo-unavailable" });
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setState({ status: "geo-denied" });
        } else {
          setState({ status: "geo-unavailable" });
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [fetchWeather]);

  return {
    state,
    selectedRegion,
    searchAndSelect,
    retry,
    requestGeolocation,
  };
}
