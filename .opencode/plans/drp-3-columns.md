# Plan: Mega DPR Library — 3 cards per row

## Current
`DRPLibrary.jsx:854` → `gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))"`
Split layout me right column ≈ 600–822px chhota hai → 300px min par sirf **2 columns** fit hote hain.

## Change — `frontend-user/src/components/DRPLibrary.jsx` (2 jagah)

1. Card grid div (line ~854): `gridTemplateColumns` hata ke class **`drp-grid`** laga
2. Existing `<style>` block me add:
   ```css
   .drp-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
   @media (max-width: 1024px) { .drp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
   @media (max-width: 640px)  { .drp-grid { grid-template-columns: 1fr; } }
   ```
   - `minmax(0, 1fr)` → long variant names overflow nahi karenge (auto-fill tha wahi kaam karta tha)
   - Desktop par **exactly 3 cards/row** (≈190–260px per card — card layout stack hai, adjust ho jayega)
   - ≤1024 viewport → 2, ≤640 → 1 (responsive safety)
   - `gap: 16` as-is

## Not changed
- Cards ka content/expand logic, filters, layout split — kuch nahi

## Verify
- `npx vite build` → EXIT=0
- Desktop: 3 columns; mobile: 1 column
