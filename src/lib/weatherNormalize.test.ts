import { describe, it, expect } from "vitest";
import { normalizeBmkgForecast, getNearestForecastPoint } from "./weatherNormalize";
import fullFixture from "@/data/bmkg-response.fixture.json";
import emptyFixture from "@/data/bmkg-response-empty.fixture.json";
import partialFixture from "@/data/bmkg-response-partial.fixture.json";
import type { BmkgRawResponse, WeatherPoint } from "@/types/weather";

describe("normalizeBmkgForecast", () => {
  it("returns complete forecast from fixture", () => {
    const result = normalizeBmkgForecast(fullFixture as unknown as BmkgRawResponse);
    expect(result).not.toBeNull();
    expect(result!.source).toBe("BMKG");
    expect(result!.region.village).toBe("Kemayoran");
    expect(result!.days.length).toBeGreaterThanOrEqual(1);
    expect(result!.days.length).toBeLessThanOrEqual(3);
  });

  it("sets correct region from fixture", () => {
    const result = normalizeBmkgForecast(fullFixture as unknown as BmkgRawResponse);
    expect(result!.region.province).toBe("DKI Jakarta");
    expect(result!.region.city).toBe("Jakarta Pusat");
    expect(result!.region.district).toBe("Kemayoran");
    expect(result!.region.village).toBe("Kemayoran");
  });

  it("has analysis_date from fixture", () => {
    const result = normalizeBmkgForecast(fullFixture as unknown as BmkgRawResponse);
    expect(result!.analysisDateUtc).toBe("2026-07-03T00:00:00Z");
  });

  it("sorts points by localDateTime", () => {
    const result = normalizeBmkgForecast(fullFixture as unknown as BmkgRawResponse);
    for (const day of result!.days) {
      for (let i = 1; i < day.points.length; i++) {
        expect(
          day.points[i].localDateTime >= day.points[i - 1].localDateTime
        ).toBe(true);
      }
    }
  });

  it("converts temperature to number", () => {
    const result = normalizeBmkgForecast(fullFixture as unknown as BmkgRawResponse);
    const firstPoint = result!.days[0]?.points[0];
    expect(firstPoint).toBeDefined();
    expect(typeof firstPoint!.temperatureC).toBe("number");
  });

  it("returns null for empty data array", () => {
    const result = normalizeBmkgForecast(emptyFixture as unknown as BmkgRawResponse);
    expect(result).not.toBeNull();
    expect(result!.days).toEqual([]);
  });

  it("handles null/empty fields without crashing", () => {
    const result = normalizeBmkgForecast(partialFixture as unknown as BmkgRawResponse);
    expect(result).not.toBeNull();
    const point = result!.days[0]?.points[0];
    expect(point!.temperatureC).toBeNull();
    expect(point!.humidityPct).toBeNull();
    expect(point!.windSpeedKmh).toBeNull();
    expect(point!.cloudCoverPct).toBeNull();
    expect(point!.visibilityText).toBeNull();
  });

  it("handles fallback region", () => {
    const fallback = {
      adm4: "31.71.03.1001",
      province: "DKI Jakarta",
      city: "Jakarta Pusat",
      district: "Kemayoran",
      village: "Kemayoran",
    };
    const result = normalizeBmkgForecast(
      {} as unknown as BmkgRawResponse,
      fallback
    );
    expect(result).not.toBeNull();
    expect(result!.region.adm4).toBe("31.71.03.1001");
  });
});

describe("getNearestForecastPoint", () => {
  it("returns null for empty array", () => {
    expect(getNearestForecastPoint([])).toBeNull();
  });

  it("returns the first future point when available", () => {
    const points: WeatherPoint[] = [
      {
        utcDateTime: "2020-01-01T03:00:00Z",
        localDateTime: "2020-01-01T10:00:00",
        temperatureC: 28,
        humidityPct: 75,
        weatherDescription: "Cerah",
        windSpeedKmh: 10,
        windDirection: "Timur",
        cloudCoverPct: 30,
        visibilityText: "10 km",
      },
      {
        utcDateTime: "2099-01-01T03:00:00Z",
        localDateTime: "2099-01-01T10:00:00",
        temperatureC: 30,
        humidityPct: 70,
        weatherDescription: "Cerah",
        windSpeedKmh: 12,
        windDirection: "Timur",
        cloudCoverPct: 20,
        visibilityText: "12 km",
      },
    ];
    const nearest = getNearestForecastPoint(points);
    expect(nearest).not.toBeNull();
    // Should find the future one
    expect(nearest!.localDateTime).toBe("2099-01-01T10:00:00");
  });

  it("returns last point when all are past", () => {
    const points: WeatherPoint[] = [
      {
        utcDateTime: "2020-01-01T03:00:00Z",
        localDateTime: "2020-01-01T10:00:00",
        temperatureC: 28,
        humidityPct: 75,
        weatherDescription: "Cerah",
        windSpeedKmh: 10,
        windDirection: "Timur",
        cloudCoverPct: 30,
        visibilityText: "10 km",
      },
    ];
    const nearest = getNearestForecastPoint(points);
    expect(nearest).not.toBeNull();
    expect(nearest!.temperatureC).toBe(28);
  });
});
