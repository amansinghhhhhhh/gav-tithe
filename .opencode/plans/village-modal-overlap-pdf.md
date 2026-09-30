# Plan: Village modal — header overlap fix + PDF download (watermark)

## Req (user)
1. Village popup me table header (`# ID Name Mobile Status Submitted`) **sticky header se overlap** ho raha hai
2. Popup me **Download PDF button** chahiye — report PDF me download ho, **watermark apna (brand logo)** ho

## Issue 1 — Root cause
Modal panel: header `position:sticky, top:0` (height ≈ 76-80px variable — title line + subtitle + 18px×2 padding, naam wrap ho to aur) aur thead `sticky top: 73` **hard-coded**. Mismatch → scroll par thead header ke neeche se overlap karta hai.

**Fix — flex-column restructure (magic number khatam):**
```
panel: display:flex; flexDirection:column; maxHeight:86vh; overflow:hidden
  header: flexShrink:0  (sticky ki zarurat nahi — panel hi scroll nahi hoga)
  body wrapper: overflowY:auto  (YEHI ab scroller hai)
    table: thead sticky top:0, z-index:1  (header ke neeche bilkul sahi chipakta)
```
- `overflowY: auto` panel se body-wrapper me shift; header ki fixed height ki koi calculation nahi chahiye
- Panel ka `overflowY: auto` hatao → `overflow: hidden`
- Modal open rehne ke baaki behavior (Esc/backdrop/✕/loading) unchanged

## Issue 2 — PDF download

### Deps
`npm i jspdf jspdf-autotable` (frontend-admin)
- `jspdf-autotable@5.x` peer: `jspdf ^2||^3||^4` ✓ (jspdf@4.2.1 ke saath compatible, user-app wale version se match)
- Import style (v5 non-browser default): `import { jsPDF } from "jspdf"; import { autoTable } from "jspdf-autotable";` → `autoTable(doc, {...})`

### Button
Modal header me count-pill ke baad, ✕ se pehle:
`⬇ PDF` pill — `background: C.navy, color:#fff, borderRadius:999, padding 6px 14px, fontSize 12, fontWeight 700`, disabled + spinner text while generating

### PDF content (A4 portrait, margin 12mm)
1. **Heading**: "Gaon Tithe Udyojak" (navy 16 bold) + subline `Village — Taluka, District` (12, textopa) + `Generated: <date en-IN> · <N> registrations` (10)
2. **autoTable**:
   - head: `["#", "ID", "Name", "Mobile", "Status", "Submitted"]`
   - body: villageDetail.users — `#`, `uniqueId || "—"`, `fullName||name`, `mobile`, status label (Draft/Submitted/... jaise modal badge), `submittedAt` formatted `DD Mon YYYY` ya `—`
   - theme `grid`, headStyles `{ fillColor: [20,41,82], textColor: 255, fontSize: 9, halign: "left" }`, bodyStyles `{ fontSize: 9 }`, alternateRowStyles `{ fillColor: [248,250,252] }`, margin `{ top: 30, bottom: 20 }`, `didDrawPage` me watermark + footer
3. **Watermark (har page)** — `didDrawPage` hook:
   - `gulogotransparent.png` (admin/src/assets — brand logo PNG, seedha import) 
   - `doc.setGState(new doc.GState({ opacity: 0.1 }))` → center me, rotate -30°, width ~110mm (`addImage(data, "PNG", x, y, w, h, undefined, "FAST", -30)` — rotation param), restore GState opacity 1
   - ye FormPreview (user-app) wale watermark ka exact style — 10% opacity, -30°
4. **Footer (har page)**: `page X / Y` (9pt, textopa, center) — autoTable `didDrawPage` me `doc.internal.getNumberOfPages()` / `doc.internal.getCurrentPageInfo().pageNumber`
5. **Save**: `report_<village>_<taluka>.pdf` (slugified, lowercase, spaces → `-`)

### Files
- `frontend-admin/package.json` (2 deps)
- `frontend-admin/src/pages/Reports.jsx` — modal restructure + Download PDF button + `downloadReportPdf()` helper (modal ke andar ya file bottom me)

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Bundle me `jspdf`/`autoTable` strings check
- Deploy: Vercel (frontend-admin)
