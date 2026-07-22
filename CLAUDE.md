# LihatLangit — Claude Context

## Project
Next.js weather dashboard at lihatlangit.vercel.app showing Indonesian weather from BMKG API.
Stack: Next.js 16, TypeScript, Tailwind CSS v4, Leaflet maps, Vercel deployment.

## Critical BMKG API Facts
- BMKG only responds to **1XXX format** adm4 codes (e.g. `32.01.01.1001`) — 0XXX always returns 404
- BMKG aggressively rate-limits after ~50 requests (429) — mass scanning is not feasible
- Only a fraction of Indonesia's 80,534 villages have BMKG data — this is a BMKG limitation, not a bug
- Pattern `adm3.1001` (e.g. `32.01.01.1001`) has the highest hit rate across provinces

## Fallback Chain (regionSearch.ts)
When exact adm4 fails, system tries:
1. Direct variants (0XXX ↔ 1XXX)
2. Other villages in same district (adm3) — cap 15, 2 variants each
3. Other districts in same city (adm2) — cap 10, injects `adm3.1001` pattern
4. Other cities in same province (adm1) — cap 10, injects `adm2.01.1001` pattern
5. Nearest by coordinates + other provinces

## Key Files
- `src/app/api/weather/route.ts` — main weather API, MAX_FALLBACK_ATTEMPTS=20
- `src/lib/regionSearch.ts` — fallback chain logic, `findBmkgFallback()`
- `src/components/DashboardClient.tsx` — main dashboard, IndonesiaWeatherMap lazy-loaded
- `public/data/regions-adm4.json` — 80,534 Indonesian regions dataset
- `scripts/scan-bmkg-coverage.js` — script to scan BMKG coverage (run manually, low concurrency)

## Optimizations Done
- favicon.ico created (16x16, 32x32, 48x48)
- `layout.tsx` icons config updated to use favicon.ico as primary
- SmartTips.tsx crash fix: `p?.weatherDescription?.toLowerCase() ?? false`
- IndonesiaWeatherMap lazy-loaded with `next/dynamic` + `ssr: false`
- Cache-Control headers added to all API routes (weather: 5min, regions: 1hr, content: 30min)
- `prefers-reduced-motion` added to globals.css
- `loading.tsx` deleted (redundant, caused double flash)
- `EducationNews.tsx` deleted (dead code)
- regionSearch.ts level 2 bug fixed: `slice(0,8)` → `getAdm3Prefix()`

## Known Limitations
- Many villages show "Data Tidak Tersedia" — BMKG simply doesn't have data for those villages
- This is expected behavior after exhausting the full fallback chain
- Recommended UX: update error message to suggest searching nearby kecamatan/kota

## SEO Status
- Google Search Console connected, verification code in layout.tsx
- sitemap, robots.txt, llms.txt in place
- Favicon recently added — Google needs time to update icon display
