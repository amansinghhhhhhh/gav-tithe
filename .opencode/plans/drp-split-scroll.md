# Plan: DRP Library — true split-scroll (left fixed, right scrolls)

## User intent (clarified)
- **Left "फिल्टर्स" pane: bilkul fixed** — page scroll par hilega nahi (sticky wala slide-up behavior nahi chahiye tha)
- **Right "मेगा DPR लायब्ररी" section: sirf wahi scroll kare**
- Yaani independent scroll panes (dashboard-style split layout)

## Current state (to revert/adjust)
- Root row: `alignItems: "stretch"` ✓ (rechna hi hai)
- Left wrapper: `overflow: "clip"` → sticky ko allow karta tha (ab hataana hai)
- Left panel: `position: sticky, top: 20, maxHeight: calc(100vh-40), overflowY: auto` → **remove** (sticky nahi chahiye)
- Right column: no overflow (page-level scroll) → **yahi change hoga**

## Changes — sirf `frontend-user/src/components/DRPLibrary.jsx`

1. **Root row** → class add: `className="drp-split"` (style `alignItems: "stretch"` rehta hai)
2. **Existing `<style>` block** me add (breakpoint 1200 = App ka `isMobile`, padding se match):
   ```css
   .drp-split { height: calc(100vh - 56px); }        /* desktop: main padding 28+28 */
   @media (max-width: 1199px) { .drp-split { height: calc(100vh - 108px); } }  /* mobile: 80+28 */
   ```
   → root ki height viewport-bounded → App ka page-level scroll is page par band
3. **Left wrapper**: `overflow: "clip"` → `overflowX: "hidden", overflowY: "auto"`
   - collapse animation (width 0) preserved via hidden-X clip
   - filters content viewport se lambi ho to sirf andar scroll (aam fit case me koi scrollbar nahi → truly fixed look)
4. **Left inner card**: `position: sticky / top / maxHeight / overflowY` **remove** (plain fixed card)
5. **Right content div** (`flex: 1, minWidth: 0`): add `overflowY: "auto"` → **sirf ye scroll karega** (hero + search + results)

## Not changed
- Filter/search logic, hero, cards, App.jsx, backend — nothing
- `.filter-toggle-btn` mobile media query (900px) as-is

## Verify
- `npx vite build` → EXIT=0
- Behavior: left pane static (never moves); right column scrollbar; filters tall → internal scroll; toggle-collapse still works
