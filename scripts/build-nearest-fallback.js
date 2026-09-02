/**
 * Build public/data/bmkg-nearest.json — precomputed nearest region WITH data.
 *
 * For every adm3 (kecamatan) in regions-adm4.json, find the closest adm3 that
 * has a known-working BMKG code (from bmkg-coverage.json). Offline — no BMKG
 * network calls. Output maps adm3 → up to 3 candidate codes, tier-ordered:
 *
 *   tier 0: same adm3 (has coverage itself)
 *   tier 1: another adm3 in the same adm2 (kabupaten/kota)
 *   tier 2: another adm3 in the same adm1 (provinsi)
 *   tier 3: adm3 in the nearest province (island-aware distance)
 *
 * Run: node scripts/build-nearest-fallback.js
 */

const fs = require("fs");
const path = require("path");

const REGIONS_PATH = path.join(__dirname, "../public/data/regions-adm4.json");
const COVERAGE_PATH = path.join(__dirname, "../public/data/bmkg-coverage.json");
const OUT_PATH = path.join(__dirname, "../public/data/bmkg-nearest.json");

/** Province centroids (approx lat/lon) — real geographic distance for tier 3 */
const CENTROIDS = {
  11: [4.7, 96.5], 12: [2.2, 99.0], 13: [-0.9, 100.4], 14: [0.5, 101.5],
  15: [-1.6, 103.0], 16: [-3.0, 104.0], 17: [-3.6, 102.3], 18: [-5.1, 105.1],
  19: [-2.7, 106.3], 21: [0.9, 104.8], 31: [-6.2, 106.8], 32: [-6.9, 107.5],
  33: [-7.3, 110.0], 34: [-7.8, 110.4], 35: [-7.6, 112.5], 36: [-6.1, 106.0],
  51: [-8.4, 115.2], 52: [-8.6, 118.0], 53: [-9.7, 121.0], 61: [-0.5, 111.5],
  62: [-2.0, 113.5], 63: [-3.0, 115.5], 64: [0.8, 116.5], 65: [3.0, 116.5],
  71: [1.0, 124.9], 72: [-1.0, 121.0], 73: [-4.0, 120.0], 74: [-3.9, 122.0],
  75: [0.6, 122.9], 76: [-2.7, 119.2], 81: [-3.3, 129.5], 82: [0.3, 127.5],
  91: [-4.0, 138.5], 94: [-7.0, 140.0],
};

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const a1 = Math.sin(dLat / 2) ** 2 +
    Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a1), Math.sqrt(1 - a1));
}

/** Distance between two province codes (centroid haversine, km). */
function provDist(a, b) {
  const ca = CENTROIDS[a];
  const cb = CENTROIDS[b];
  if (!ca || !cb) return Math.abs(a - b) * 100;
  return haversineKm(ca, cb);
}

function adm3Of(code) {
  return code.split(".").slice(0, 3).join(".");
}

function main() {
  const regions = JSON.parse(fs.readFileSync(REGIONS_PATH, "utf-8"));
  const coverage = JSON.parse(fs.readFileSync(COVERAGE_PATH, "utf-8"));

  // adm3 → first known-working code
  const working = {};
  for (const [adm3, code] of Object.entries(coverage)) {
    if (code) working[adm3] = code;
  }
  const workingAdm3s = Object.keys(working); // indexed later
  console.log(`working adm3: ${workingAdm3s.length}`);

  // All adm3 present in the dataset
  const allAdm3 = new Set();
  for (const r of regions) allAdm3.add(adm3Of(r.adm4));
  console.log(`total adm3: ${allAdm3.size}`);

  const adm2Of = (adm3) => adm3.slice(0, 5);
  const adm1Of = (adm3) => adm3.slice(0, 2);

  // Index working adm3s by adm2 / adm1 for fast tier-1/2 lookup
  const byAdm2 = {};
  const byAdm1 = {};
  for (const adm3 of workingAdm3s) {
    (byAdm2[adm2Of(adm3)] = byAdm2[adm2Of(adm3)] || []).push(adm3);
    (byAdm1[adm1Of(adm3)] = byAdm1[adm1Of(adm3)] || []).push(adm3);
  }
  const provsWorking = Object.keys(byAdm1).map(Number).sort((x, y) => x - y);

  const out = {};
  let tierCount = [0, 0, 0, 0, 0];

  for (const adm3 of [...allAdm3].sort()) {
    const scored = [];

    // tier 0: same adm3
    if (working[adm3]) {
      scored.push({ adm3, tier: 0, score: 0 });
    }

    // tier 1: same adm2 (collect even if tier 0 exists — more candidates)
    for (const other of byAdm2[adm2Of(adm3)] || []) {
      if (other !== adm3) {
        scored.push({
          adm3: other,
          tier: 1,
          score: Math.abs(parseInt(other.slice(6), 10) - parseInt(adm3.slice(6), 10)),
        });
      }
    }

    // tier 2: same adm1
    for (const other of byAdm1[adm1Of(adm3)] || []) {
      if (other !== adm3) {
        scored.push({
          adm3: other,
          tier: 2,
          score:
            Math.abs(parseInt(other.slice(6), 10) - parseInt(adm3.slice(6), 10)) +
            Math.abs(parseInt(adm2Of(other).slice(3), 10) - parseInt(adm2Of(adm3).slice(3), 10)) * 100,
        });
      }
    }

    // tier 3: nearest province with coverage (centroid distance)
    const prov = parseInt(adm1Of(adm3), 10);
    const nearestProvs = provsWorking
      .map((p) => ({ p, d: provDist(prov, p) }))
      .sort((x, y) => x.d - y.d)
      .slice(0, 3);
    for (const { p, d } of nearestProvs) {
      for (const other of byAdm1[String(p)]) {
        if (other !== adm3) {
          scored.push({
            adm3: other,
            tier: 3,
            score: d * 1000 +
              Math.abs(parseInt(other.slice(6), 10) - parseInt(adm3.slice(6), 10)) +
              Math.abs(parseInt(adm2Of(other).slice(3), 10) - parseInt(adm2Of(adm3).slice(3), 10)) * 100,
          });
        }
      }
    }

    // Dedupe + sort by (tier, score), keep top 6 different adm3 (was 3)
    const seen = new Set();
    const top = scored
      .sort((a, b) => a.tier - b.tier || a.score - b.score)
      .filter((c) => (seen.has(c.adm3) ? false : (seen.add(c.adm3), true)))
      .slice(0, 6);

    if (!top.length) {
      tierCount[4]++;
      continue;
    }
    tierCount[top[0].tier]++;
    out[adm3] = top.map((c) => [working[c.adm3], c.tier]);
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(out));
  console.log(`written: ${OUT_PATH} (${Object.keys(out).length} adm3)`);
  console.log(`coverage tier distribution: 0=${tierCount[0]} 1=${tierCount[1]} 2=${tierCount[2]} 3=${tierCount[3]} none=${tierCount[4]}`);
}

main();