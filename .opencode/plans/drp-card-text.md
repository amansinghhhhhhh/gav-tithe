# Plan: DRP card text — thoda chhota + left align

**Scope (user confirmed): sirf DRP card ka text** (3-column me fit + dekhne me saaf).

## Changes — `frontend-user/src/components/DRPLibrary.jsx` (DRPCard, lines ~965–1200)

| Element | Abhi | Naya |
|---|---|---|
| Variant name `h3` (line 969) | 16px | **14px** |
| "(Variant 845)" span (line 976) | 13px | **11px** |
| Location 📍 (line 985) | 13px | **12px** |
| Investment box (line 999/1006) | 14px, **center** | **13px, left** |
| ROI box (line 1023) | **center** | **left** + padding `10px 0` → `8px 10px` |
| ROI number (line 1031) | 22px | **17px** |
| Jobs box (line 1053) | **center** | **left** + padding `8px 10px` |
| Jobs number (line 1061) | 22px | **17px** |
| Subsidy text (line ~1108, 13px) | 13px | **12px** |
| Expanded paragraphs (2 jagah, 13px) | 13px | **12px** |
| Footer hint "▼ View details" (line ~1200) | **center** | **left** |

- Sector (11) / ODOP chip (10) / tags (10) / ROI-Jobs labels (11) — already chhote, as-is
- "Open DPR Builder" button — standard CTA (centered) as-is
- Colors/logic/layout unchanged

## Verify
- `npx vite build` → EXIT=0
