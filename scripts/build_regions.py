"""
Build comprehensive regions-adm4.json from BPS/Kemendagri administrative data.
Sources from emsifa/api-wilayah-indonesia:
  - provinces.csv, regencies.csv, districts.csv, villages.csv
Output: regions-adm4.json with adm4, province, city, district, village fields
"""
import csv
import json
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")
OUTPUT_FILE = os.path.join(DATA_DIR, "regions-adm4.json")

def load_csv(filename):
    """Load CSV with header (id, name) or (id, parent_id, name)"""
    path = os.path.join(DATA_DIR, filename)
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        rows = []
        for row in reader:
            if len(row) >= 2:
                rows.append(row)
    return rows

def main():
    print("Loading CSV data...")
    
    # Load all data
    provinces = load_csv("provinces.csv")  # id, name
    regencies = load_csv("regencies.csv")  # id, province_id, name
    districts = load_csv("districts.csv")  # id, regency_id, name
    villages = load_csv("villages.csv")    # id, district_id, name
    
    print(f"  Provinces: {len(provinces)}")
    print(f"  Regencies: {len(regencies)}")
    print(f"  Districts: {len(districts)}")
    print(f"  Villages: {len(villages)}")
    
    # Build lookup dicts
    prov_map = {row[0]: row[1] for row in provinces}
    
    reg_map = {}
    for row in regencies:
        if len(row) >= 3:
            reg_map[row[0]] = {"province_id": row[1], "name": row[2]}
    
    dist_map = {}
    for row in districts:
        if len(row) >= 3:
            dist_map[row[0]] = {"regency_id": row[1], "name": row[2]}
    
    # Helper: convert flat id (XXYYZZWWWW) to adm4 (XX.YY.ZZ.WWWW)
    def to_adm4(village_id):
        if len(village_id) >= 10:
            return f"{village_id[0:2]}.{village_id[2:4]}.{village_id[4:6]}.{village_id[6:10]}"
        return village_id
    
    # Helper: determine timezone from province
    def get_timezone(province_id):
        p_id = int(province_id)
        # Western Indonesia (WIB, UTC+7): Sumatra (11-19), Java (31-36, except 35?)
        # Actually the standard Kemendagri codes:
        # 11-19 = Sumatra (WIB)
        # 21-29 = other islands in WIB area
        # 31-36 = Java (WIB)
        # 51-53 = Bali & Nusa Tenggara (WITA)
        # 61-64 = Kalimantan (mostly WITA, some WIB)
        # 71-76 = Sulawesi (WITA)
        # 81-82 = Maluku (WIT)
        # 91-94 = Papua (WIT)
        
        if 11 <= p_id <= 19:  # Sumatra
            return "Asia/Jakarta"
        elif 21 <= p_id <= 29:  # Kep. Riau, Bengkulu etc
            return "Asia/Jakarta"
        elif 31 <= p_id <= 36:  # Java
            return "Asia/Jakarta"
        elif p_id == 51:  # Bali
            return "Asia/Makassar"
        elif 52 <= p_id <= 53:  # NTB, NTT
            return "Asia/Makassar"
        elif 61 <= p_id <= 64:  # Kalimantan
            return "Asia/Makassar"
        elif 71 <= p_id <= 76:  # Sulawesi
            return "Asia/Makassar"
        elif 81 <= p_id <= 82:  # Maluku
            return "Asia/Jayapura"
        elif 91 <= p_id <= 94:  # Papua
            return "Asia/Jayapura"
        else:
            return "Asia/Jakarta"
    
    # Build the output
    output = []
    skipped = 0
    no_province = set()
    
    for v in villages:
        village_id = v[0]
        district_id = v[1] if len(v) > 2 else ""
        village_name = v[2] if len(v) > 2 else v[1]
        
        # Get district info
        dist_info = dist_map.get(district_id)
        if not dist_info:
            skipped += 1
            continue
        
        # Get regency info
        reg_info = reg_map.get(dist_info["regency_id"])
        if not reg_info:
            skipped += 1
            continue
        
        # Get province info
        prov_name = prov_map.get(reg_info["province_id"])
        if not prov_name:
            no_province.add(reg_info["province_id"])
            skipped += 1
            continue
        
        adm4 = to_adm4(village_id)
        timezone = get_timezone(reg_info["province_id"])
        
        entry = {
            "adm4": adm4,
            "province": prov_name,
            "city": reg_info["name"],
            "district": dist_info["name"],
            "village": village_name,
            "timezone": timezone,
        }
        
        # Remove None values to keep JSON clean
        entry = {k: v for k, v in entry.items() if v is not None}
        output.append(entry)
    
    # Sort by adm4 for reproducibility
    output.sort(key=lambda x: x["adm4"])
    
    print(f"\nOutput: {len(output)} regions")
    print(f"Skipped: {skipped}")
    if no_province:
        print(f"Missing province IDs: {sorted(no_province)}")
    
    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    file_size = os.path.getsize(OUTPUT_FILE)
    print(f"Written to {OUTPUT_FILE}")
    print(f"File size: {file_size:,} bytes ({file_size/1024/1024:.1f} MB)")

if __name__ == "__main__":
    main()
