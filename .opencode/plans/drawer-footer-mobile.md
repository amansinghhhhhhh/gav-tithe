# Plan: Drawer footer — mobile-stacked buttons

## Req
User: drawer footer wala section (`Clear All` + `Show 24 results`) mobile ke according banao.
Approved: **Stacked buttons**.

## Problem (researched — `DRPLibrary.jsx` lines 540-576, CSS ~1003)
- Row layout: `Clear All` auto + `Show N results` flex:1 → 320px pe cramped, Marathi text `24 निवडलेले दाखवा →` wrap/overflow
- Tap height ~44px marginal, no `env(safe-area-inset-bottom)` (iPhone home bar overlap)
- Footer bg gradient partial (`#fff 35%`) → content dikh sakta hai buttons ke neeche

## Change — 1 file: `frontend-user/src/components/DRPLibrary.jsx`

### A. JSX footer (lines ~540-576): stacked column
- Container: flex `column`, `gap: 8`
- Button 1 — **Clear All** (ghost): full width, `border 1.5px rgba(20,41,82,.25)`, navy text, `height 44`, `fontSize 14`, `whiteSpace: nowrap`
- Button 2 — **Show N results →** (primary): full width, `C.navy` bg, white, `height 48`, `fontSize 15`, `fontWeight 800`, `whiteSpace: nowrap`, `boxShadow: 0 4px 14px rgba(20,41,82,.35)`
- Order: ghost upar, primary neeche (thumb reach)
- Text same as abhi (mr: `सर्व काढा` / `N निवडलेले दाखवा →`; en: `Clear All` / `Show N results →`)

### B. CSS `.drp-drawer-footer` (line ~1003)
- `flex-direction: column; gap: 8px`
- `padding: 12px 0 calc(14px + env(safe-area-inset-bottom))`
- `background: #fff` + `boxShadow: 0 -6px 18px rgba(15,32,64,.12)` (gradient hatao)
- `border-top: 1px solid rgba(20,41,82,.08)`

## Verify
- `npx vite build` (frontend-user) → EXIT=0; bundle me `drp-drawer-footer` + `safe-area`

## Deploy
- Vercel (frontend-user) — pending batch me
