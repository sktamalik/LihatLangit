# LihatLangit — Claude Context

## Project
Next.js weather dashboard at lihatlangit.vercel.app showing Indonesian weather from BMKG API.
Stack: Next.js 16, TypeScript, Tailwind CSS v4, Leaflet maps, Vercel deployment, GitHub Actions CI.

## Critical BMKG API Facts
- BMKG only responds to **1XXX format** adm4 codes (e.g. `32.01.01.1001`) — 0XXX always returns 404
- BMKG aggressively rate-limits after ~50 requests (429) and can block IP (403) — mass scanning not feasible
- **429/403 handling**: `fetchForecast()` retries (default ×2, 500ms/1500ms backoff) with User-Agent rotation; takes optional `maxRetries` 3rd param (batch uses 1, fallback probes 0); `route.ts` short-circuits on 429/403 instead of firing the fallback chain
- Only a fraction of Indonesia's 80,534 villages have BMKG data — this is a BMKG limitation, not a bug
- Pattern `adm3.1001` (e.g. `32.01.01.1001`) has the highest hit rate across provinces
- IP block 403 typically clears in 1–7 days; avoid mass scans (use `scripts/scan-bmkg-coverage.js` with CONCURRENCY=1, DELAY=1200ms)

## Fallback Chain (regionSearch.ts)
When exact adm4 fails (404 or 200-with-empty-data), system tries (`findBmkgFallback(adm4, 35)`):
- **Level N (nearest-with-data)**: NEW — precomputed `bmkg-nearest.json` maps EVERY adm3 to 1-3 known-working codes, closest first (tier 0 = same adm3, 1 = same city, 2 = same province, 3 = nearest province by centroid haversine). Probed FIRST (1-3 requests) — almost always succeeds without burning the 35-probe chain. Fallback chain only runs if this misses (or on rate-limit → abort).
- **Level C**: coverage-guided — known-working codes from `bmkg-coverage.json` for same adm3 + same adm2 (city)
- **Level P**: ALL known-working coverage codes in the same province
- **Level O**: known-working coverage codes from other provinces, nearest province first (centroid distance; dataset has NO coordinates of its own) 
- **Level 0**: direct variants + `adm3.1001-1015` AND `adm3.2001-2010` probes (sebagian desa hanya ada di format 2XXX)
- **Level 1**: same district — inject `adm3.1001` first, other villages (cap 5)
- **Level 2**: other districts in same city (cap 6), injects `adm3.1001`
- **Level 3**: other cities in province — **prioritize kota `XX.71+`** over rural kabupaten, injects `adm2.XX.01.1001`/`2001` (cap 20)
- **Level 5**: last resort — first village from each other province (cap 15), city pattern `XX.71.01.1001`

Verified coverage codes are ALWAYS probed before blind patterns — they returned 200 during the scan, so they hit immediately and spare BMKG requests. Fallback probe chain aborts early on 429/403 to avoid IP blocks. `route.ts` also falls through to the chain when BMKG returns 200 with empty `data[]` (previously returned EMPTY_FORECAST without fallback).

**"Data Tidak Tersedia" is now nearly impossible**: `bmkg-nearest.json` guarantees every one of the 4,571 kecamatan has ≥1 known-working candidate (572 codes from coverage; nearest province fallback otherwise). E.g. LATIUNG (Aceh) → P.O. Hurlang (Sumut), Fakfak (Papua Barat) → Wawali (Sulut). Rebuild the map after re-scanning coverage: `npm run build:nearest`.

## Key Files
- `src/app/api/weather/route.ts` — main weather API; probes precomputed nearest-with-data codes FIRST (1-3 req, 3s timeout), then fallback in parallel batches of 5 (3s timeout), `findBmkgFallback(adm4, 35)`, 429/403 short-circuit aborts all further probing; **rate-limit path serves stale cache or cached nearest-with-data data (zero BMKG requests) before returning 502**; exact fetch 5s timeout × 1 retry + hard wall-clock budget 8.5s (TOTAL_BUDGET_MS) keeps route inside Vercel 10s limit; 200-with-empty-`data[]` falls through to fallback chain (not EMPTY_FORECAST); header shows SEARCHED region, `fallbackFrom` = actual data source
- `src/app/api/weather-batch/route.ts` — national map endpoint (max 40 codes): concurrency 5, primary 4s timeout × 2 attempts, fallback probes parallel in batches of 5 (3s, no retries), **shared rate-limit flag** (one 429/403 aborts BMKG probes but cached/stale cities still resolve), returns partial results on failure
- `src/lib/regionSearch.ts` — fallback chain logic, coverage-guided, city-priority Level 3; `findNearestWithData(adm3)` loads precomputed `bmkg-nearest.json`
- `src/lib/bmkgClient.ts` — BMKG fetch with retry + User-Agent rotation; `fetchForecast(adm4, timeoutMs, maxRetries)`
- `src/middleware.ts` — Edge rate limiter (30 req/60s/IP) — moved from serverless (in-memory Map useless there)
- `src/components/DashboardClient.tsx` — main dashboard, IndonesiaWeatherMap lazy-loaded (`next/dynamic` + `ssr:false`)
- `src/components/IndonesiaWeatherMap.tsx` — national map; **weather-batch fetch DI-GATE ke viewport** (IntersectionObserver, rootMargin 400px, sekali per mount) — dulu fetch 38 kota tiap page load, itu penyebab rate-limit BMKG di semua user
- `public/data/regions-adm4.json` — 80,534 Indonesian regions dataset
- `public/data/bmkg-coverage.json` — scanned adm3 → known-working code map (partial, ~1.2K/4.5K)
- `public/data/bmkg-nearest.json` — precomputed adm3 → closest known-working codes (tier 0-3), ALL 4,571 adm3 covered; build with `npm run build:nearest` (`scripts/build-nearest-fallback.js`)
- `scripts/scan-bmkg-coverage.js` — scan script (CONCURRENCY=1, DELAY=1200ms; resume-able)

## Features Added
- `src/components/EarthquakeWarning.tsx` + `src/app/api/gempa/route.ts` — live BMKG TEWS earthquakes (5-min cache), case-insensitive field access (`Magnitude`/`Kedalaman`/`Wilayah`/`Potensi`)
- `src/components/WindDirection.tsx` — compass arrow for wind direction + Beaufort scale, integrated into WeatherSummary
- `src/components/ScrollReveal.tsx` — IntersectionObserver fade-in-up on scroll, staggered delays in dashboard
- `src/components/SectionDots.tsx` — scroll-spy dots fixed on the right viewport edge, one per section (Beranda/Dashboard/Peta Cuaca/Prakiraan/Berita BMKG); active section = solid orange dot (`bg-primary-container`, 12px), inactive = hollow gray (8px); click smooth-scrolls; `hidden md:flex` (desktop only)

## Optimizations Done
- favicon.ico created; `layout.tsx` icons config updated
- SmartTips.tsx crash fix: `p?.weatherDescription?.toLowerCase() ?? false`
- IndonesiaWeatherMap lazy-loaded with `next/dynamic` + `ssr: false`
- Cache-Control headers on all API routes (weather: 5min, regions: 1hr, content: 30min)
- `prefers-reduced-motion` in globals.css; `loading.tsx` deleted (double flash)
- `EducationNews.tsx` deleted (dead code)
- regionSearch.ts level 2 bug fixed: `slice(0,8)` → `getAdm3Prefix()`
- **Duplicate timezone logic removed** — weatherNormalize.ts now imports `formatLocalNow`/`getLocalTodayStr`/`getLocalTomorrowStr` from `time.ts`
- **Canonical URL fix** — `layout.tsx` SITE_URL no longer uses `VERCEL_URL` (preview URL leak); defaults to `https://lihatlangit.vercel.app`
- **National map speedup** — `weather-batch` was serial-probing 15 fallback codes per city (worst ~75s, blew Vercel 10s limit); now parallel batches of 5 with 3s timeout, 4s primary × 2 attempts, shared rate-limit abort + per-code wall-clock budget 9s → 38 cities load in ~1.5s warm / ~3.5s cold
- **Fallback cache-safety** — rate-limit in batch no longer skips cached/stale cities; cache check always runs, only BMKG network calls are skipped
- **`fallbackFrom` notice** — dashboard header shows the SEARCHED region; a small "Data dari wilayah terdekat: X" line appears when fallback data is used

## CI/CD
- **GitHub Actions** (`.github/workflows/ci.yml`): typecheck + lint + build on every push/PR (Node 22)
  - **Important**: `npm ci` fails in CI due to optional-dep drift (`@emnapi/*` versions differ Windows vs Linux) — use `npm install --force` in the workflow, not `npm ci`
  - eslint `--format github` is NOT available in eslint 9.39 — use `npm run lint` (stylish)
  - `scripts/**` is ignored in eslint config (Node scripts, not app code)
  - `react-hooks/set-state-in-effect` disabled via comment for async fetch patterns in EarthquakeWarning/IndonesiaWeatherMap
- **Vercel** deploys automatically on push (independent of GitHub Actions status)

## Known Limitations
- Many villages show "Data Tidak Tersedia" — BMKG simply doesn't have data for those villages; expected after exhausting the full fallback chain
- Fallback chain now covers nearby kota (e.g. Flores Timur → Kota Kupang, Laladon → Cibinong) so most real searches succeed
- **`regions-adm4.json` has NO coordinates** (all null) — Level 4 (nearest-by-coords) was dead code and removed; Level O uses province-code proximity (≈ island grouping) instead of real distance. `findNearestRegion()` always returns null; geolocation relies on Nominatim reverse geocode
- National map: remote provinces (Papua/Maluku/Kaltara) may occasionally miss a city when BMKG rate-limits mid-batch — partial results returned; retry or next load fills from cache
- Vercel Hobby 10s function timeout: primary fetch is 2 sequential × 10s = 20s worst case — consider `maxDuration` if upgrading

## SEO Status
- Google Search Console connected, verification code in layout.tsx
- sitemap, robots.txt, llms.txt in place
- Canonical URL fixed to lihatlangit.vercel.app (was leaking preview URL)
