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
- **Level C**: coverage-guided — known-working codes from `bmkg-coverage.json` for same adm3 + same adm2 (city)
- **Level P**: ALL known-working coverage codes in the same province
- **Level O**: known-working coverage codes from other provinces, nearest province first (province-code ≈ island grouping; dataset has NO coordinates, so real distance is impossible)
- **Level 0**: direct variants + `adm3.1001-1010` probes
- **Level 1**: same district — inject `adm3.1001` first, other villages (cap 5)
- **Level 2**: other districts in same city (cap 6), injects `adm3.1001`
- **Level 3**: other cities in province — **prioritize kota `XX.71+`** over rural kabupaten, injects `adm2.XX.01.1001`/`2001` (cap 20)
- **Level 5**: last resort — first village from each other province (cap 15), city pattern `XX.71.01.1001`

Verified coverage codes are ALWAYS probed before blind patterns — they returned 200 during the scan, so they hit immediately and spare BMKG requests. Fallback probe chain aborts early on 429/403 to avoid IP blocks. `route.ts` also falls through to the chain when BMKG returns 200 with empty `data[]` (previously returned EMPTY_FORECAST without fallback).

## Key Files
- `src/app/api/weather/route.ts` — main weather API; fallback in parallel batches of 5 (3s timeout), `findBmkgFallback(adm4, 35)`, 429/403 short-circuit; 200-with-empty-`data[]` falls through to fallback chain (not EMPTY_FORECAST); header shows SEARCHED region, `fallbackFrom` = actual data source
- `src/app/api/weather-batch/route.ts` — national map endpoint (max 40 codes): concurrency 5, primary 4s timeout × 2 attempts, fallback probes parallel in batches of 5 (3s, no retries), **shared rate-limit flag** (one 429/403 aborts BMKG probes but cached/stale cities still resolve), returns partial results on failure
- `src/lib/regionSearch.ts` — fallback chain logic, coverage-guided, city-priority Level 3
- `src/lib/bmkgClient.ts` — BMKG fetch with retry + User-Agent rotation; `fetchForecast(adm4, timeoutMs, maxRetries)`
- `src/middleware.ts` — Edge rate limiter (30 req/60s/IP) — moved from serverless (in-memory Map useless there)
- `src/components/DashboardClient.tsx` — main dashboard, IndonesiaWeatherMap lazy-loaded
- `public/data/regions-adm4.json` — 80,534 Indonesian regions dataset
- `public/data/bmkg-coverage.json` — scanned adm3 → known-working code map (partial, ~1.2K/4.5K)
- `scripts/scan-bmkg-coverage.js` — scan script (CONCURRENCY=1, DELAY=1200ms; resume-able)

## Features Added
- `src/components/EarthquakeWarning.tsx` + `src/app/api/gempa/route.ts` — live BMKG TEWS earthquakes (5-min cache), case-insensitive field access (`Magnitude`/`Kedalaman`/`Wilayah`/`Potensi`)
- `src/components/WindDirection.tsx` — compass arrow for wind direction + Beaufort scale, integrated into WeatherSummary
- `src/components/ScrollReveal.tsx` — IntersectionObserver fade-in-up on scroll, staggered delays in dashboard

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
- **National map speedup** — `weather-batch` was serial-probing 15 fallback codes per city (worst ~75s, blew Vercel 10s limit); now parallel batches of 5 with 3s timeout, 4s primary × 2 attempts, shared rate-limit abort → 38 cities load in ~1.5s warm / ~3.5s cold
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
