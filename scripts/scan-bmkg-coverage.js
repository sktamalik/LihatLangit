/**
 * Scan semua kecamatan (adm3) — test adm3.1001 dulu, fallback ke 1002-1010.
 * Output: public/data/bmkg-coverage.json
 * Run: node scripts/scan-bmkg-coverage.js
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const CONCURRENCY = 5;
const TIMEOUT_MS = 8000;
const DELAY_MS = 250;
const OUT_PATH = path.join(__dirname, "../public/data/bmkg-coverage.json");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function bmkgGet(adm4) {
  return new Promise((resolve) => {
    const req = https.get(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`,
      {
        timeout: TIMEOUT_MS,
        headers: { "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36" },
      },
      (res) => { res.resume(); resolve(res.statusCode === 429 ? "rl" : res.statusCode === 200); }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => { req.destroy(); resolve(false); });
  });
}

async function findWorkingCode(adm3) {
  // Try 1001 first (highest hit rate), then 1002-1015
  const probes = [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015];
  for (const n of probes) {
    const code = `${adm3}.${n}`;
    const result = await bmkgGet(code);
    if (result === "rl") {
      process.stdout.write("\n  [429] waiting 90s...");
      await sleep(90000);
      const retry = await bmkgGet(code);
      if (retry === true) return code;
    } else if (result === true) {
      return code;
    }
    await sleep(DELAY_MS);
  }
  return null;
}

async function main() {
  const regions = JSON.parse(fs.readFileSync(path.join(__dirname, "../public/data/regions-adm4.json"), "utf-8"));
  const adm3Set = new Set();
  for (const r of regions) adm3Set.add(r.adm4.split(".").slice(0, 3).join("."));
  const adm3List = [...adm3Set].sort();

  let coverage = {};
  if (fs.existsSync(OUT_PATH)) {
    coverage = JSON.parse(fs.readFileSync(OUT_PATH, "utf-8"));
    // Reset null entries so they get retried with new logic
    for (const k of Object.keys(coverage)) {
      if (coverage[k] === null) delete coverage[k];
    }
  }

  const todo = adm3List.filter((a) => !(a in coverage));
  const withData = Object.values(coverage).filter(Boolean).length;
  console.log(`Total: ${adm3List.length} | Already scanned: ${Object.keys(coverage).length} (${withData} with data) | Remaining: ${todo.length}`);
  console.log(`concurrency=${CONCURRENCY} delay=${DELAY_MS}ms — est. ${Math.ceil(todo.length * 1 * DELAY_MS / CONCURRENCY / 60000)} min`);

  if (todo.length === 0) { console.log("Complete."); return; }

  let done = 0, found = 0, notFound = 0;
  const queue = [...todo];

  async function worker() {
    while (queue.length > 0) {
      const adm3 = queue.shift();
      const code = await findWorkingCode(adm3);
      coverage[adm3] = code;
      done++; if (code) found++; else notFound++;
      if (done % 20 === 0 || done === todo.length) {
        fs.writeFileSync(OUT_PATH, JSON.stringify(coverage, null, 2));
        const pct = ((done / todo.length) * 100).toFixed(1);
        process.stdout.write(`\r[${pct}%] ${done}/${todo.length} — found: ${found}, not found: ${notFound}   `);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  fs.writeFileSync(OUT_PATH, JSON.stringify(coverage, null, 2));

  const total = Object.keys(coverage).length;
  const finalFound = Object.values(coverage).filter(Boolean).length;
  console.log(`\n\nDone! ${finalFound}/${total} kecamatan punya data BMKG (${((finalFound/total)*100).toFixed(1)}%)`);
}

main().catch(console.error);
