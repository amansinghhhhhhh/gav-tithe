# Plan: DPR Builder — edge-to-edge fullscreen

## Req
User: "tum boxed q krte ho full width kr do" → DPR Builder modal ab boxed hai (`width: min(780px,100%)`, overlay `padding:16`, `borderRadius:18`, `maxHeight:92vh`). Decision: **pure edge-to-edge fullscreen**.

## Change (sirf `frontend-user/src/components/DPRBuilder.jsx`)

1. **Overlay div** (~line 250): `padding: 16` → `padding: 0`
2. **Panel div** (~line 276–282):
   - `width: "min(780px, 100%)"` → `width: "100%"`
   - `maxHeight: "92vh"` → `height: "100%"` (ya maxHeight 100vh)
   - `borderRadius: 18` → `0`
   - `boxShadow` hata sakte ho (edge pe shadow dikhne wala nahi) — optional

Header/tabs/body/footer waise hi flex-column chalte rahenge — body scroll (`overflowY:auto, flex:1`) intact. Hidden report div (PDF capture) untouched.

## Verify
- `npx vite build` (frontend-user) → EXIT=0

## Deploy
- Vercel (frontend-user) — pending batch me
