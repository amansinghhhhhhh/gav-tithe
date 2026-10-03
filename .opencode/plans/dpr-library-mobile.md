# Plan: Mega DPR Library — mobile fix (hamburger filter drawer + layout)

## Req
User: mobile pe ache se visible nahi; **hamburger me sare filters** (approved) + **poora mobile layout bhi check karo** (approved).

## Root cause (researched)
1. **Filters sidebar 270px fixed, `showFilters` default `true`** → 360px phone pe content sirf ~70px bachta = squeezed
2. `.filter-toggle-btn` (≤900) collapse karta hai par sidebar overlay nahi karta — UX kharab
3. Hero: `padding 26/28`, icon 46px, title 26px, results-pill absolute top-right + `paddingRight:110` — chhoti screen pe overlap/wrap
4. Search input `fontSize 14` → iOS pe focus par auto-zoom (<16px rule)
5. Grid/cards already responsive ✓ (1 col ≤640), `main` full width ho chuka ✓

## Changes — sab `frontend-user/src/components/DRPLibrary.jsx`

### A. Hamburger filter drawer (≤900px)
- Naya hook `useIsMobile(bp)` (useState + resize listener) — `isTablet = useIsMobile(900)`, `isSmall = useIsMobile(640)`
- `showFilters` state **hatao**; naya `filtersOpen` state
- Sidebar:
  - **Desktop (>900)**: inline div `width/minWidth 270` hamesha (collapse logic khatam)
  - **Mobile (≤900)**: sidebar JSX wapas use — wrapper fixed drawer:
    - `.drp-drawer { position: fixed; left:0; top:0; bottom:0; width: min(320px,86vw); z-index:10001; transform: translateX(-102%); transition: transform .28s ease; overflow-y:auto; padding:12px 12px 0 }`
    - `.drp-drawer.open { transform: none }` + backdrop `.drp-backdrop { position:fixed; inset:0; background:rgba(15,32,64,.5); z-index:10000 }` (click → close)
    - Drawer me **sticky footer**: `Clear All` + primary `Show N results →` (N = `filteredEntries.length`) → close
- Toolbar button (line ~691): `☰ {lang mr ? "फिल्टर" : "Filters"}` + active-filter count chip (agar `hasActiveFilters`) → `setFiltersOpen(true)`
- Body scroll lock jab drawer open; resize >900 pe auto-close
- CSS (existing `<style>` block me add): `.drp-drawer`, `.drp-drawer.open`, `.drp-backdrop`, fade animation

### B. Hero mobile (≤640 — `isSmall` se branch)
- `padding: "26px 28px"` → `"18px 16px"`
- Icon `46 → 36`, icon font `24 → 18`
- Title `26px → 20px`; subtitle `14 → 12.5` (wrap allowed)
- Results pill: `top/right 16/18 → 10/10`, `fontSize 13 → 11`, `padding 6/14 → 4/10`; title row `paddingRight 110 → 86`
- Search: `fontSize 14 → 16` (iOS zoom avoid), `maxWidth 560` → `100%`, margin-top 14→14 (rakho)
- Orange glow circle: chhota `230 → 160` (overflow hidden hai hi)

### C. Baaki audit (done — no change needed)
- `.drp-grid`: 1 col ≤640 / 2 ≤1024 ✓, cards padding ok ✓
- `main maxWidth:100%` + mobile padding `80px 24px` ✓; header 60px fixed ✓
- `.drp-split` height `100vh-108px` ≤1199 ✓ (drawer ke baad content full width)

## Verify
- `npx vite build` (frontend-user) → EXIT=0; bundle me `drp-drawer` string
- Mobile emu (≤900): ☰ → drawer slide-in → filters select → `Show N results` → grid full width

## Deploy
- Vercel (frontend-user) — pending batch me
