# Plan: Mega DPR Library — user-side redesign + search

**User confirmed:** data bilkul wahi rahega (24 entries API se, future admin updates auto-reflect hote rahenge) — **no backend/data changes**. Sirf `frontend-user` design.

## Changes (2 files)

### 1. `frontend-user/src/components/DRPLibrary.jsx` — redesign + search

**Hero header (naya):** gradient banner `linear-gradient(125deg,#142952 0%,#1d3f7a 55%,#16305f 100%)` + subtle orange glow accent, radius 16, padding 28:
- 📚 glass badge + **"Mega DPR Library"** (white, 26px, 800) — replaces old `h2 "DRP Library"` (line 422)
- Subtitle: **"1050+ Detailed Project Reports · DIC/KVIC Compliant"** (white 75%, 14px)
- **Search bar** (prominent, white pill, radius 999, 🔍 icon left, clear × right):
  - placeholder EXACT: **`Search Project... (e.g. masala, papad, dairy etc..)`** (same text dono languages me — user ne exact copy di)
  - instant client-side filter

**Search logic:** `search` state → `filteredEntries` memo = search + sector + investment + district sab client-side:
- Search fields: `variantName, sector, odop, category, location, tags` (case-insensitive substring)
- **Fetch ab sirf ek baar mount par** (no params) — filter sab client-side → API call bachte hain (apiLimiter 100/15min!), aur server ke buggy investment filter ki jagah sahi overlap logic: `investmentMin <= r.max && investmentMax >= r.min`
- Empty state search-aware: `"‘masala’ ke liye काहीतरी सापडले नाही"` style message + search term dikhao

**Layout polish:**
- Hero ke neeche toolbar: results count chip (existing `X Results`) + filter-toggle + active-filter tags (existing, restyled)
- Left filters sidebar: structure same (sector checkboxes/investment radios/district select), thoda polish (header accent, spacing)
- Card grid: same cards (sector color bar, ROI/Jobs, subsidy, tags), gap/typography tune-up
- Mobile: search full-width, filters collapse (existing `.filter-toggle-btn` media query retained)

**Marathi strings (inline):** title `"मेगा DPR लायब्ररी"`, subtitle `"1050+ सविस्तर परियोजना अहवाल · DIC/KVIC अनुरूप"`

### 2. `frontend-user/src/components/Sidebar.jsx` (lines 64-66)
- `label: "Mega DPR Library"`, `labelMr: "मेगा DPR लायब्ररी"` (nav key `dpr_library` unchanged)

## Not changed
- Backend, DB, seed data, API params — **no Railway deploy**
- translations.js (strings inline `lang==="mr"` pattern — existing convention here)
- Admin panel

## Verify
- `npx vite build` (frontend-user) → EXIT=0
- Search: "papad"/"masala"/"dairy" filters instantly; combined with sector/district/investment filters
