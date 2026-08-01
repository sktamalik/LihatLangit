# LihatLangit — Claude Context

## Project
Next.js weather dashboard at lihatlangit.vercel.app showing Indonesian weather from BMKG API.
Stack: Next.js 16, TypeScript, Tailwind CSS v4, Leaflet maps, Vercel deployment, GitHub Actions CI.

## Critical BMKG API Facts
- BMKG only responds to **1XXX format** adm4 codes (e.g. `32.01.01.1001`) — 0XXX always returns 404
- BMKG aggressively rate-limits after ~50 requests (429) and can block IP (403) — mass scanning not feasible
- **429/403 handling**: `fetchForecast()` retries ×2 (500ms/1500ms backoff) with User-Agent rotation; `route.ts` short-circuits on 429/403 instead of firing the fallback chain
- Only a fraction of Indonesia's 80,534 villages have BMKG data — this is a BMKG limitation, not a bug
- Pattern `adm3.1001` (e.g. `32.01.01.1001`) has the highest hit rate across provinces
- IP block 403 typically clears in 1–7 days; avoid mass scans (use `scripts/scan-bmkg-coverage.js` with CONCURRENCY=1, DELAY=1200ms)

## Fallback Chain (regionSearch.ts)
When exact adm4 fails, system tries (`findBmkgFallback(adm4, 35)`):
- **Level C**: coverage-guided — known-working codes from `bmkg-coverage.json` first
- **Level 0**: direct variants + `adm3.1001-1010` probes
- **Level 1**: same district — inject `adm3.1001` first, other villages (cap 5)
- **Level 2**: other districts in same city (cap 6), injects `adm3.1001`
- **Level 3**: other cities in province — **prioritize kota `XX.71+`** over rural kabupaten, injects `adm2.XX.01.1001`/`2001` + coverage data (cap 20)
- **Level 4**: nearest villages from other provinces by coords (cap 10, boosted for provinces with coverage)
- **Level 5**: first village from each other province (cap 15), city pattern `XX.71.01.1001` + coverage

## Key Files
- `src/app/api/weather/route.ts` — main weather API; fallback in parallel batches of 5 (3s timeout), `findBmkgFallback(adm4, 35)`, 429/403 short-circuit
- `src/lib/regionSearch.ts` — fallback chain logic, coverage-guided, city-priority Level 3
- `src/lib/bmkgClient.ts` — BMKG fetch with retry + User-Agent rotation
- `src/middleware.ts` — Edge rate limiter (30 req/60s/IP) — moved from serverless (in-memory Map useless there)
- `src/components/DashboardClient.tsx` — main dashboard, IndonesiaWeatherMap lazy-loaded
- `public/data/regions-adm4.json` — 80,534 Indonesian regions dataset
- `public/data/bmkg-coverage.json` — scanned adm3 → known-working code map (partial, ~1.2K/4.5K)
- `scripts/scan-bmkg-coverage.js` — scan script (CONCURRENCY=1, DELAY=1200ms; resume-able)

## Features Added
- `src/components/EarthquakeWarning.tsx` + `src/app/api/gempa/route.ts` — live BMKG TEWS earthquakes (5-min cache), case-insensitive field access (`Magnitude`/`Kedalaman`/`Wilayah`/`Potensi`)
- `src/components/WindDirection.tsx` — compass arrow for wind direction + Beaufort scale, integrated into WeatherSummary
- `src/components/ScrollReveal.tsx` — IntersectionObserver fade-in-up on scroll, staggered delays in dashboard
- **Dark Mode** — `src/lib/ThemeProvider.tsx` (class-based, localStorage + prefers-color-scheme), `DarkModeToggle.tsx`, anti-flash script in layout, `@custom-variant dark` + `.dark` CSS variable overrides in globals.css

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
- Vercel Hobby 10s function timeout: primary fetch is 2 sequential × 10s = 20s worst case — consider `maxDuration` if upgrading

## SEO Status
- Google Search Console connected, verification code in layout.tsx
- sitemap, robots.txt, llms.txt in place
- Canonical URL fixed to lihatlangit.vercel.app (was leaking preview URL)
