#!/usr/bin/env python3
"""Convert assets/data.xls → maharashtraData.js + maharashtraVillages.js"""

import json
import sys
from collections import defaultdict
from pathlib import Path

import xlrd

ROOT = Path(__file__).resolve().parents[1]
XLS = ROOT / "frontend-user" / "src" / "assets" / "data.xls"
OUT_DIST = ROOT / "frontend-user" / "src" / "constants" / "maharashtraData.js"
OUT_VILL = ROOT / "frontend-user" / "src" / "constants" / "maharashtraVillages.js"

DISTRICT_RENAME = {
    "Ahmadnagar": "Ahmednagar",
    "Bid": "Beed",
    "Buldana": "Buldhana",
    "Gondiya": "Gondia",
    "Mumbai": "Mumbai City",
    "Raigarh": "Raigad",
}


def norm_district(name: str) -> str:
    name = name.strip()
    return DISTRICT_RENAME.get(name, name)


def main() -> int:
    if not XLS.exists():
        print(f"MISSING: {XLS}", file=sys.stderr)
        return 1

    wb = xlrd.open_workbook(str(XLS))
    sh = wb.sheet_by_index(0)
    headers = [str(sh.cell_value(0, c)).strip() for c in range(sh.ncols)]
    try:
        di = headers.index("DISTRICT NAME")
        ti = headers.index("Taluka")
        vi = headers.index("Village")
    except ValueError as e:
        print(f"Missing column: {e}", file=sys.stderr)
        return 1

    talukas_by_dist = defaultdict(set)
    villages_by = defaultdict(lambda: defaultdict(set))

    for r in range(1, sh.nrows):
        d = str(sh.cell_value(r, di)).strip()
        t = str(sh.cell_value(r, ti)).strip()
        v = str(sh.cell_value(r, vi)).strip()
        if d in ("", "MAHARASHTRA") or t in ("", "MAHARASHTRA") or v in ("", "MAHARASHTRA"):
            continue
        d = norm_district(d)
        talukas_by_dist[d].add(t)
        villages_by[d][t].add(v)

    districts = sorted(talukas_by_dist.keys())
    data = {d: sorted(talukas_by_dist[d]) for d in districts}
    villages = {
        d: {t: sorted(villages_by[d][t]) for t in sorted(villages_by[d])}
        for d in districts
    }

    dist_js = (
        "// AUTO-GENERATED from src/assets/data.xls — do not edit by hand\n"
        "// Run: python scripts/convert_xls.py\n"
        "const maharashtraData = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n\n"
        "export const districts = Object.keys(maharashtraData).sort();\n\n"
        "export const getTalukas = (district) => maharashtraData[district] || [];\n\n"
        "export default maharashtraData;\n"
    )
    OUT_DIST.write_text(dist_js, encoding="utf-8")

    vill_js = (
        "// AUTO-GENERATED from src/assets/data.xls — do not edit by hand\n"
        "// Run: python scripts/convert_xls.py\n"
        "const villageData = "
        + json.dumps(villages, ensure_ascii=False, indent=2)
        + ";\n\n"
        "export const getVillages = (district, taluka) =>\n"
        "  villageData[district]?.[taluka] || [];\n\n"
        "export default villageData;\n"
    )
    OUT_VILL.write_text(vill_js, encoding="utf-8")

    n_vill = sum(len(vs) for d in villages for vs in villages[d].values())
    n_tal = sum(len(ts) for ts in data.values())
    print(f"districts={len(districts)} talukas={n_tal} villages={n_vill}")
    print(f"wrote {OUT_DIST.relative_to(ROOT)} ({OUT_DIST.stat().st_size // 1024} KB)")
    print(f"wrote {OUT_VILL.relative_to(ROOT)} ({OUT_VILL.stat().st_size // 1024} KB)")

    current_36 = {
        "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Bhandara","Buldhana",
        "Chandrapur","Dhule","Gadchiroli","Gondia","Hingoli","Jalgaon","Jalna",
        "Kolhapur","Latur","Mumbai City","Mumbai Suburban","Nagpur","Nanded",
        "Nandurbar","Nashik","Osmanabad","Palghar","Parbhani","Pune","Raigad",
        "Ratnagiri","Sangli","Satara","Sindhudurg","Solapur","Thane","Wardha",
        "Washim","Yavatmal",
    }
    missing = sorted(current_36 - set(districts))
    extra = sorted(set(districts) - current_36)
    if missing:
        print(f"NOTE missing vs old list: {missing}")
    if extra:
        print(f"NOTE extra vs old list: {extra}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
