# Plan: Maharashtra place renames (display-only)

**Approved by user** (scope confirmed via questions). Status: READY TO EXECUTE.

## Scope
- Districts (display only, values/backend keys unchanged):
  - `Ahmednagar` → en "Ahilya Nagar" / mr "अहिल्यानगर"
  - `Aurangabad` → en "Chhatrapati Sambhaji Nagar" / mr "छत्रपती संभाजीनगर"
  - `Osmanabad` → en "Dharashiv" / mr "धाराशिव"
- Taluka: `Velhe` (Pune) → en "Rajgad" / mr "राजगड"
- NOT renamed: village entries (incl. HQ towns), HQ tehsils (Ahmadnagar/Aurangabad/Osmanabad), other same-named villages (e.g. Nagpur|Katol|Ahmednagar)
- Islampur (Sangli) → Ishwarpur: **no data entry exists** — nothing to change
- Admin panel: YES (English display)

## Why display-only
Old stored forms, admin grouping/filters, DRP, RegionMap coords, reports export all match English VALUES (`Ahmednagar` etc.) — values stay, only labels change. Search works for old name (value match) AND new name (label match).

## Steps

### 1. NEW `frontend-user/src/constants/placeRename.js`
```js
const RENAME = {
    district: {
        Ahmednagar: { en: "Ahilya Nagar", mr: "अहिल्यानगर" },
        Aurangabad: { en: "Chhatrapati Sambhaji Nagar", mr: "छत्रपती संभाजीनगर" },
        Osmanabad: { en: "Dharashiv", mr: "धाराशिव" },
    },
    taluka: { Velhe: { en: "Rajgad", mr: "राजगड" } },
    village: {},
};
export const override = (kind, lang, s) => RENAME[kind]?.[s]?.[lang] || null;
```

### 2. NEW `frontend-admin/src/constants/placeRename.js` — same content (copy)

### 3. User portal wiring (3 files)
- `frontend-user/src/components/sections/Section1.jsx`
  - import `{ override } from "../../constants/placeRename"`
  - line ~109: `const disp = (kind, map, s) => override(kind, lang, s) || (lang === "mr" && map && map[s] ? map[s] : s);`
  - `dispVillage = (s) => disp("village", villageMrData?.villageMr, s)`
  - line 597: `disp("district", districtMr, d)`
  - line 616: `disp("taluka", talukaMr, x)`
- `frontend-user/src/components/DRPLibrary.jsx`
  - import override; line 373: `override("district", lang, d) || (lang === "mr" ? districtMr[d] || d : d)`
  - line 506: `override("district", lang, selectedDistrict) || (lang === "mr" ? districtMr[selectedDistrict] || selectedDistrict : selectedDistrict)`
- `frontend-user/src/components/FormPreview.jsx`
  - import override; `place = (kind, map, s) => override(kind, lang, s) || (lang === "mr" && map && map[s] ? map[s] : s)`
  - address: `place("district", districtMr, addr.dist)`, `place("taluka", talukaMr, addr.taluka)`, `place("village", villageMr, village)`

### 4. Admin wiring (4 files, `lang="en"`)
- `frontend-admin/src/components/RegionMap.jsx:107` — `{override("district", "en", d.district) || d.district}`
- `frontend-admin/src/pages/EntrepreneurHeatmap.jsx`
  - :86 taluka chart labels → `override("taluka","en",t.taluka) || t.taluka`
  - :89 district chart labels → `override("district","en",d.district) || d.district`
  - :199 `<option>` label → override district
  - :254 title → override district/taluka in template strings
  - :330-331 table cells u.district / u.taluka → override (values in filters/onClick unchanged)
- `frontend-admin/src/pages/Reports.jsx` (display only — onClick/filters RAW values)
  - :129 village detail header (taluka/dist)
  - :233 `d.dist`, :296 `t.dist`, :299 `t.taluka`, :367 `v.dist`, :370 `v.taluka`
  - :255, :323-325 titles with selectedDist/selectedTaluka
- `frontend-admin/src/pages/UserDetail.jsx:205-206` — `Row label="Dist." value={override("district","en",addr.dist) || addr.dist}`, taluka Row similarly

### 5. Verify
- `npx vite build` in `frontend-user` AND `frontend-admin`

## Not changed
Backend/Mongo values, AUTO-GENERATED data files (`maharashtraData*.js`, `maharashtraVillages*.js`), `scripts/marathi_places.py`, admin filters/grouping/coords, report exports.
