# Plan: Fix `/entrepreneur-heatmap` crash — `override is not defined`

## Root cause
- `frontend-admin/src/components/RegionMap.jsx:107` `override("district", "en", ...)` use karta hai (tooltip rendering — `.map` ke andar, stack trace se match) **par file me import hi nahi hai**
- Imports: sirf `react` + `react-leaflet` + `leaflet.css`
- Bundler unresolved identifier ko global maan leta hai → **build pass, runtime `ReferenceError`** → poora heatmap page crash
- `EntrepreneurHeatmap.jsx` khud override import karta hai ✓, par wo **`<RegionMap />` render karta hai** → wahi se crash
- Scan: poore repo me **sirf RegionMap.jsx** me ye missing hai (Reports/UserDetail/EntrepreneurHeatmap/DRPLibrary sab me import ✓)

## Fix (1 line)
`frontend-admin/src/components/RegionMap.jsx` — imports me add:
```js
import { override } from "../constants/placeRename";
```

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Deploy: Vercel (frontend-admin)
