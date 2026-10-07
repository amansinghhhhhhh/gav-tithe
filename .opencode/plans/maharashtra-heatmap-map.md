# Maharashtra District Map — Entrepreneur Heatmap Redesign

## Goal
Replace Leaflet OSM-tile `RegionMap` in admin's Entrepreneur Heatmap with a white,
district-boundary SVG-style Maharashtra map (reference image style), interactive
markers, legend, hover tooltip, click detail panel. Zero new npm dependencies.

## Decisions (user-approved)
- Status color = activity % = `(high + medium) / total * 100`
  - ≥70% → High (orange `#F97316`), 30–70% → Medium (green `#16a34a`), <30% → Low (blue `#3b82f6`)
  - Thresholds configurable in ONE place: `mapConfig.js`
- District click → detail panel (stats + activity% + status + **Apply Filter** button → existing cascade filter)
- Map tech: react-leaflet (already installed) GeoJSON layer, **no TileLayer** (white bg),
  districts = SVG paths (leaflet renders vector as SVG) → no new library

## Files
| Action | File |
|---|---|
| Create | `frontend-admin/src/assets/maharashtraDistricts.json` (90KB GeoJSON, downloaded once from udit-001/india-maps-data CDN) |
| Create | `frontend-admin/src/constants/mapConfig.js` (thresholds, colors, marker scale, API→geojson district mapping) |
| Create | `frontend-admin/src/components/MaharashtraMap.jsx` (reusable: `data, loading, error, selectedDistrict, onApplyFilter`) |
| Modify | `frontend-admin/src/pages/EntrepreneurHeatmap.jsx` (swap map component, wire onApplyFilter → setSelDist cascade) |
| Delete | `frontend-admin/src/components/RegionMap.jsx` (unused after swap) |

## MaharashtraMap internals
- No TileLayer → white background; GeoJSON districts: fill #fff, border #d1d5db, hover highlight
- 1 aggregated CircleMarker per district: radius = sqrt-scale on `total`, fill = status color
- Hover tooltip: district, applications, active ideas (high+medium), status
- Click → detail panel card with "Apply Filter" → `onApplyFilter(district)`
- Legend overlay (React, not leaflet) + loading/error/empty states inside component
- Unmatched API districts (not in geojson) listed in small note below map
- Responsive height `min(420px, 60vh)`, touch zoom on, scrollWheelZoom off

## District name mapping (API → geojson)
GeoJSON has: Mumbai (not "Mumbai City"), Mumbai Suburban, Ahmednagar, Aurangabad, Osmanabad...
- `Mumbai City` → `Mumbai`
- all others identity (placeRename.js handles display names separately)

## Verify
- `npm run build` in frontend-admin → EXIT 0
