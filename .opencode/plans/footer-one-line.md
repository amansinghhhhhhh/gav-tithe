# Plan: My Introduction footer — single compact row (mobile)

## Req
User: My Introduction form ka footer (`Back` / `Save as Draft` / `Submit →`) mobile pe 3 lines me ja raha — **1 line me chahiye**.
Approved: **Single compact row**.

## Problem (researched)
- File: `frontend-user/src/components/FooterBar.jsx` (sirf 1 usage — `App.jsx:335`)
- Container: `padding: 14px 24px`, `gap: 12`, `justifyContent: flex-start`, no `flexWrap`/`nowrap`
- Buttons: `padding 10px 20-28px`, `fontSize 14` → total ~380px vs mobile content width ~312px → squeeze + button text wrap (3 lines)
- Marathi labels: `मागे` / `मसुदा जतन करा` / `सबमिट करा →` — thode lambe

## Change — 1 file: `frontend-user/src/components/FooterBar.jsx`
Container (line ~15-26):
- `padding: "14px 24px"` → `"12px 12px"`
- `gap: 12` → `8`
- `justifyContent: "flex-start"` → `"space-between"`
- add `flexWrap: "nowrap"`

Buttons (sab 3 — Back, Save Draft, Submit/Next):
- `padding: "10px 24px"/"10px 20px"/"10px 28px"` → Back `"10px 12px"`, Save `"10px 12px"`, primary `"10px 16px"`
- `fontSize: 14` → `13`
- add `whiteSpace: "nowrap"` (text wrap kabhi nahi hoga)
- `flexShrink: 0` (squeeze nahi honge)

Width math (360px screen, content ~312 - container pad 24 = ~288 usable):
- EN: Back ~54 + Save as Draft ~96 + Submit → ~78 + gaps 16 ≈ 244 ✓
- MR: मागे ~34 + मसुदा जतन करा ~96 + सबमिट करा → ~92 + 16 ≈ 238 ✓

## Verify
- `npx vite build` (frontend-user) → EXIT=0; bundle me `whiteSpace: "nowrap"` + `space-between`

## Deploy
- Vercel (frontend-user) — pending batch me
