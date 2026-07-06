/**
 * Core domain types for LihatLangit weather data.
 */

export type Region = {
  adm4: string;
  province: string;
  city: string;
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export type WeatherPoint = {
  utcDateTime: string;
  localDateTime: string;
  temperatureC: number | null;
  humidityPct: number | null;
  weatherDescription: string;
  weatherDescriptionEn?: string;
  windSpeedKmh: number | null;
  windDirection: string | null;
  cloudCoverPct: number | null;
  visibilityText: string | null;
  iconUrl?: string;
};

export type WeatherDay = {
  date: string;
  label: string;
  points: WeatherPoint[];
};

export type WeatherForecast = {
  source: "BMKG";
  region: Region;
  analysisDateUtc: string | null;
  fetchedAt: string;
  fromCache: boolean;
  isStale: boolean;
  nearestPoint: WeatherPoint | null;
  days: WeatherDay[];
  /** When BMKG data comes from a nearby village instead of the exact region */
  fallbackFrom?: string;
  fallbackAdm4?: string;
};

/** Standard internal error codes */
export type ErrorCode =
  | "INVALID_ADM4"
  | "REGION_NOT_FOUND"
  | "BMKG_TIMEOUT"
  | "BMKG_UNAVAILABLE"
  | "BMKG_INVALID_RESPONSE"
  | "RATE_LIMITED"
  | "EMPTY_FORECAST";

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
  };
};

export type WeatherApiResponse = WeatherForecast | ApiError;

/** A single forecast slot from BMKG raw response */
export type BmkgSlot = {
  utc_datetime?: string;
  local_datetime?: string;
  t?: string | number | null;
  hu?: string | number | null;
  weather?: number;
  weather_desc?: string;
  weather_desc_en?: string;
  ws?: string | number | null;
  wd?: string | number | null;
  wd_deg?: number;
  tcc?: string | number | null;
  vs_text?: string;
  image?: string;
  datetime?: string;
  tp?: number;
  time_index?: string;
  analysis_date?: string;
};

/** BMKG raw API response shape (only fields we use) */
export type BmkgRawResponse = {
  lokasi: {
    provinsi?: string;
    kota?: string;
    kecamatan?: string;
    desa?: string;
    latitude?: string | number;
    longitude?: string | number;
    timezone?: string;
    adm1?: string;
    adm2?: string;
    adm3?: string;
    adm4?: string;
    kotkab?: string;
    lon?: number;
    lat?: number;
    type?: string;
  };
  data?: Array<{
    lokasi?: Record<string, unknown>;
    /** IMPORTANT: cuaca is an array of arrays — each sub-array contains slots grouped by time period */
    cuaca?: BmkgSlot[][];
  }>;
  analysis_date?: string;
};
