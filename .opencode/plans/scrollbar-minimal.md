# Plan: Left + Right dono scrollers ki width minimal (3px)

## Root cause (why abhi minimal nahi dikh raha)
`DRPLibrary.jsx:870`:
```css
.drp-split { scrollbar-width: thin; scrollbar-color: ...; }   ← STANDARD props (inherited by both panes)
.drp-split ::-webkit-scrollbar { width: 3px; ... }             ← 3px rule
```
Chrome 121+ me **standard `scrollbar-width`/`scrollbar-color` set hone par `::-webkit-scrollbar` customization IGNORE ho jata hai** → dono panes (left + right) ko Chrome ka default "thin" (~8-10px) mil raha hai, mera 3px rule kaam hi nahi kar raha.

Dono scrollers pehle se covered hain (`.drp-split ::-webkit-scrollbar` descendant selector — left wrapper + right column dono) — sirf property conflict hataani hai.

## Change — `frontend-user/src/components/DRPLibrary.jsx` `<style>` block

1. Line 870 se **`scrollbar-width: thin; scrollbar-color: ...` hata do** (height wala part `calc(100vh - 56px)` rehne do)
2. `::-webkit-scrollbar` 3px rules **as-is** (Chrome/Edge/Safari → dono panes par 3px orange rounded thumb, transparent track)
3. Firefox ke liye standard props ko **engine-gated** rakho:
   ```css
   @-moz-document url-prefix() {
     .drp-split { scrollbar-width: thin; scrollbar-color: rgba(249,115,22,0.6) transparent; }
   }
   ```
   - Chrome ye at-rule drop karta hai (unknown) → koi conflict nahi → 3px webkit rules active
   - Firefox me thin + brand color (Firefox me px width support nahi hai — `thin` uska minimum hai)

## Verify
- `npx vite build` → EXIT=0
- Chrome: dono scrollbars ~3px (left filters pane + right DPR column)
