# Plan: Admin — dropdown option text invisible + favicon

## Issue 1: Dropdown list khulti hai par options ka text invisible (hover par dikhta hai)

**Root cause:** `frontend-admin/src/index.css` `:root` me **`color-scheme: light dark`** + `@media (prefers-color-scheme: dark)` block. OS dark mode par Chrome native `<select>` ke **options popup ko dark scheme** me render karta hai, par option/select ka `color` page se inherit hota hai (inline styles + `--text`) → popup ka background aur text same tone → text invisible; hover par system highlight (blue/gray) lagta hai isliye dikhne lagta hai.

Admin **light-themed app** hai (sab cards white inline) — dark scheme ki zarurat nahi.

**Fix — `frontend-admin/src/index.css`:**
1. `:root` me `color-scheme: light dark;` → **`color-scheme: light;`** (native controls + dropdown popups hamesha light scheme me render — fix ka main hissa)
2. Bottom me add (belt & suspenders — closed select bhi crisp dikhe):
   ```css
   select { color: #111827; background-color: #fff; }
   option { color: #111827; background-color: #fff; }
   ```
   (Sab admin selects light-styled hain — inline `background: C.white` waise bhi CSS se upar hota hai; yahan explicit dark text = popup par guaranteed contrast)

Note: `@media (prefers-color-scheme: dark)` block (Vite template leftover vars) rehne dete hain — popup fix `color-scheme: light` se ho jata hai.

## Issue 2: Favicon (user chose: sirf favicon, title rehne do)

**Current:** `frontend-admin/public/favicon.svg` = **Vite default purple icon** (9.5KB, `#863bff` bolt) — hamara nahi.

**Fix:** copy `frontend-user/public/favicon.svg` (apna actual logo, 613KB SVG) → `frontend-admin/public/favicon.svg` (overwrite). `index.html` ka `<link rel="icon" href="/favicon.svg">` already sahi path hai — sirf file replace.

Title "frontend-admin" **as-is** (user ne bola sirf favicon).

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Deploy: Vercel (frontend-admin)
