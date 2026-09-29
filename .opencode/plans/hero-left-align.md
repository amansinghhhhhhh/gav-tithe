# Plan: Hero left-align + Filter sidebar sections design (DRP Library)

## Root cause (both issues)
`frontend-user/src/index.css:57` → `#root { text-align: center }` — sab block elements (h2, h4) center text inherit karte hain. Isi liye hero title/subtitle **aur** filter headings (Sector / Investment Range / District / ODOP) center dikh rahe hain. (Codebase me 40 jagah `textAlign: "left"` override pattern hai.)

## Changes — sirf `frontend-user/src/components/DRPLibrary.jsx`

### 1. Hero title/subtitle — left align
- Hero text container (~line 456): `<div style={{ minWidth: 0 }}>` → `textAlign: "left"` add (title + subtitle dono fix)

### 2. Filter sections — icon + background + left align (3 sections)
Har section ko **tinted background card** me wrap + header row (icon chip + heading), sab `textAlign: "left"`:

| Section | Icon chip | Tint bg / border |
|---|---|---|
| **Sector** | 🏭 navy chip (`C.navy`) | `rgba(20,41,82,0.05)` / `rgba(20,41,82,0.10)` |
| **Investment Range** | 💰 orange chip (`C.orange`) | `rgba(249,115,22,0.07)` / `rgba(249,115,22,0.15)` |
| **District / ODOP** | 📍 green chip (`#16a34a`) | `rgba(22,163,74,0.07)` / `rgba(22,163,74,0.15)` |

- Card: `borderRadius: 12, padding: "14px 14px 12px", border: 1.5px <tint border>`, spacing `marginBottom: 12`
- Header row: `28×28` rounded icon chip (emoji 14-15px, white/tint bg) + `h4` (13px, 800, uppercase, section-color, margin 0), row me `display:flex, alignItems:center, gap:8, textAlign:"left"`
- Checkbox/radio lists & district `<select>` waise hi (logic untouched); card ke andar thoda top-gap
- "Filters" header wrapper me bhi defensive `textAlign: "left"`

### Not changed
- Filter logic, search, data, sidebar label, backend — kuch nahi
- No new deps (emoji icons — codebase convention)

## Verify
- `npx vite build` → EXIT=0
- Visual: hero title+subtitle left; 3 headings left; sections colored background cards with icons
