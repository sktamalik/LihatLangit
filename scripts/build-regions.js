/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Build comprehensive Indonesian adm4 regions dataset.
 * Sources:
 *   - provinces.csv (emsifa/api-wilayah-indonesia)
 *   - regencies.csv
 *   - districts.csv
 *   - villages.csv
 *
 * Output: src/data/regions-adm4.json
 */

const fs = require('fs');
const path = require('path');

// Helper: read CSV as array of objects
// Supports both 2-column (id,name) and 3-column (id,parentId,name) formats
function readCSV(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').trim();
  const lines = text.split('\n');
  return lines.map(line => {
    const parts = line.split(',');
    const id = parts[0].trim();
    if (parts.length === 3) {
      return { id, parentId: parts[1].trim(), name: parts[2].trim() };
    }
    // 2 columns: id,name
    return { id, parentId: null, name: parts[1].trim() };
  });
}

// Helper: title case a string
function toTitleCase(str) {
  return str
    .replace(/^KABUPATEN /i, '')
    .replace(/^KOTA ADMINISTRASI /i, '')
    .replace(/^KOTA /i, '')
    .replace(/^KAB\. /i, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Determine timezone from province code
// More accurate than simple range check
function getTimezoneByProvince(provinceCode) {
  // WIB (UTC+7) - Sumatra, Java, West/Central/South Kalimantan
  const wib = [11,12,13,14,15,16,17,18,19,21,31,32,33,34,35,36,61,62,63];
  // WITA (UTC+8) - Bali, NTB, NTT, South/East/North Kalimantan, Sulawesi
  const wita = [51,52,53,64,65,71,72,73,74,75,76];
  // WIT (UTC+9) - Maluku, Papua
  const wit = [81,82,91,94];
  
  const code = parseInt(provinceCode, 10);
  if (wib.includes(code)) return 'Asia/Jakarta';
  if (wita.includes(code)) return 'Asia/Makassar';
  if (wit.includes(code)) return 'Asia/Jayapura';
  return 'Asia/Jakarta';
}

console.log('Loading CSV data...');
const scriptDir = __dirname; // scripts/
const provinces = readCSV(path.join(scriptDir, 'provinces.csv'));
const regencies = readCSV(path.join(scriptDir, 'regencies.csv'));
const districts = readCSV(path.join(scriptDir, 'districts.csv'));
const villages = readCSV(path.join(scriptDir, 'villages.csv'));

console.log(`Loaded: ${provinces.length} provinces, ${regencies.length} regencies, ${districts.length} districts, ${villages.length} villages`);

// Build lookup maps
const provinceMap = {};
provinces.forEach(p => { provinceMap[p.id] = p.name; });

const regencyMap = {};
regencies.forEach(r => { regencyMap[r.id] = { name: r.name, provinceId: r.parentId }; });

const districtMap = {};
districts.forEach(d => { districtMap[d.id] = { name: d.name, regencyId: d.parentId }; });

// Build the regions array
console.log('Building regions...');
const regions = [];
let skipped = 0;

villages.forEach(v => {
  const villageId = v.id;       // e.g., "1101010001"
  const districtId = v.parentId; // e.g., "1101010"
  
  if (!districtMap[districtId]) {
    skipped++;
    return;
  }
  
  const district = districtMap[districtId];
  const regencyId = district.regencyId;
  
  if (!regencyMap[regencyId]) {
    skipped++;
    return;
  }
  
  const regency = regencyMap[regencyId];
  const provinceId = regency.provinceId;
  
  if (!provinceMap[provinceId]) {
    skipped++;
    return;
  }
  
  // Parse the codes
  // villageId = province(2) + regency(2) + district(2) + village(4)
  const adm4Province = villageId.substring(0, 2);
  const adm4Regency = villageId.substring(2, 4);
  const adm4District = villageId.substring(4, 6);
  const adm4Village = villageId.substring(6, 10);
  
  const adm4 = `${adm4Province}.${adm4Regency}.${adm4District}.${adm4Village}`;
  
  regions.push({
    adm4,
    province: toTitleCase(provinceMap[provinceId]),
    city: toTitleCase(regency.name),
    district: toTitleCase(district.name),
    village: toTitleCase(v.name),
    latitude: null,
    longitude: null,
    timezone: getTimezoneByProvince(provinceId)
  });
});

console.log(`Generated ${regions.length} regions, skipped ${skipped}`);

// Check for sample data to verify alignment
const samplePath = path.join(__dirname, '..', 'src', 'data', 'regions-adm4.sample.json');
let sampleCount = 0;
let matched = 0;

try {
  const sampleData = JSON.parse(fs.readFileSync(samplePath, 'utf8'));
  sampleCount = sampleData.length;
  
  // Check if our generated data contains the sample entries
  sampleData.forEach(s => {
    const found = regions.find(r => r.adm4 === s.adm4);
    if (found) {
      matched++;
      if (found.city !== s.city || found.village !== s.village) {
        console.log(`Name mismatch for ${s.adm4}:`);
        console.log(`  Sample: province="${s.province}", city="${s.city}", district="${s.district}", village="${s.village}"`);
        console.log(`  Ours:   province="${found.province}", city="${found.city}", district="${found.district}", village="${found.village}"`);
      }
    }
  });
  console.log(`Sample has ${sampleCount} entries, matched ${matched}`);
} catch(e) {
  console.log('No sample file found or error reading it:', e.message);
}

// Write output
const outputPath = path.join(__dirname, '..', 'src', 'data', 'regions-adm4.json');
fs.writeFileSync(outputPath, JSON.stringify(regions, null, 2), 'utf8');
console.log(`\nWritten to: ${outputPath}`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
