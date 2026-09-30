# Plan: Report PDF — sahi language (Devanagari) render

## Req (user)
PDF download me jo content usi language me chahiye — abhi Marathi naam garbage aa raha hai (`K. [101;5u . C $ > ...`).

## Root cause
- jsPDF ki standard fonts (helvetica etc.) **WinAnsi-based hain — Devanagari glyphs nahi**, isliye Marathi bytes raw nikal ke garbage ban rahe
- Sirf Devanagari TTF embed bhi karo to kaam nahi chalega: jsPDF me **complex text shaping nahi** (matras position, conjunct/jodakshar reordering) — Devanagari toot jayega
- **Proven solution (codebase me pehle se):** `frontend-user/FormPreview.jsx` → `html2canvas` se browser-rendered capture (browser ke system fonts + HarfBuzz shaping = perfect Marathi) → jsPDF me page-slice + watermark

## Approach — HTML capture (raster)
`jspdf-autotable` wala vector table hatao; uski jagah **hidden print-layout div** ko html2canvas se capture karke PDF banayenge. Trade-off: text pixel-based (select nahi hoga) — lekin language 100% sahi, watermark/layout same.

## Changes

### 1. Deps (frontend-admin)
- `npm i html2canvas@1.4.1` (user-app wala same version)
- `npm uninstall jspdf-autotable` (ab unused); `jspdf` rehta hai (slicing + watermark + footer ke liye)

### 2. `frontend-admin/src/pages/Reports.jsx`

**A. Hidden report div** (jab `villageDetail && !villageLoading` ho to render, `reportRef`):
- `position: absolute; left: -99999px; top: 0; width: 760px; padding: 28px; background: #fff`
- `fontFamily: 'system-ui, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'` (Marathi glyphs browser lega)
- Layout:
  - Header row: `logoPng` img (height 40) + right side: **"Gaon Tithe Udyojak"** (navy 20/800), `Village — Taluka, District` (14, #64748b), `N registrations · Generated <date>` (11.5, #94a3b8)
  - Table (width 100%, borderCollapse, 13px): thead navy `#142952` white uppercase 11.5px; columns `# | ID | Name | Mobile | Status | Submitted`; rows border `#e2e8f0`, zebra `#f8fafc`; Status = existing `<StatusBadge>`; dates `DD Mon YYYY` / `—`

**B. `downloadReportPdf` rewrite:**
```js
const { default: html2canvas } = await import("html2canvas");
const { jsPDF } = await import("jspdf");
const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: "#fff", logging: false });
const { jsPDF } = await import("jspdf");
```
- Page-slice logic **FormPreview jaisa hi** (margin 6mm, `mmPerPx = PAGE_W / canvas.width`, per-page canvas crop)
- **Watermark har page** — existing `rotateImage(logo, -30)` + `GState opacity 0.1` code as-is rehne do (sirf cropping loop me)
- **Footer**: totalPages pehle se calculate (slice math se) → har page `Page ${p} / ${total}` (ASCII → jsPDF text safe)
- `doc.save(report_<village>_<taluka>.pdf)` — slug helper as-is
- Heading ab HTML me hai → jsPDF `doc.text("Gaon Tithe Udyojak"...)` wala block hatao (pure ASCII tha, par ab HTML header capture me aa jayega)

**C. Cleanup:**
- `autoTable` import + pura autoTable options block hatao
- `STATUS_LABELS` / `statusLabel()` hatao (StatusBadge HTML use hoga); `slug`, `loadImage`, `rotateImage` rehne do (watermark/filename ke liye)
- Button/`pdfBusy` behavior unchanged

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Bundle: `html2canvas` chunk + `Preparing...` strings
- Deploy: Vercel (frontend-admin)
