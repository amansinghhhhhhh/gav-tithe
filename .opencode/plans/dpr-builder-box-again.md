# Plan: DPR Builder popup wapas box (780px)

## Req
User: "Popup wapas box karo (780px)" — abhi DPR Builder edge-to-edge fullscreen hai (2 turns pehle aapki choice se), ab wapas boxed chahiye.

## Change — sirf `frontend-user/src/components/DPRBuilder.jsx`

1. **Overlay** (~line 258): `padding: 0` → `padding: 16` (bahar ka margin wapas)
2. **Panel** (~lines 278–286) — fullscreen settings revert:
   - `borderRadius: 0` → `18`
   - `width: "100%"` → `"min(780px, 100%)"`
   - `height: "100%"` → `maxHeight: "92vh"` (height hatao)
   - `boxShadow: "0 30px 70px rgba(15,32,64,.45)"` wapas add
3. **Body/andar ka content**: unchanged — white background + transparent step blocks hi rahega (jo last fix tha, usse content box nahi lagta)

Result: centered 780px modal, 16px margin, radius 18, shadow — pehle jaisa; andar ka content full-width (white, bina cards ke).

## Verify
- `npx vite build` (frontend-user) → EXIT=0

## Deploy
- Vercel (frontend-user) — pending batch
