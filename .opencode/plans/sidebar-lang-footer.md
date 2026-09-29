# Plan: Sidebar EN/मराठी toggle — pinned footer (no scroll needed)

**Approved by user.** Status: READY TO EXECUTE (awaiting plan-mode exit).

## Problem
`frontend-user/src/components/Sidebar.jsx` — EN/मराठी toggle + Sign Out are at the END of the scrollable nav column (lines 383-432). On short viewports the content overflows and the scrollbar is hidden (`scrollbarWidth:"none"`, line 295), so users must scroll blindly to change language.

Note: Header.jsx has its own English/मराठी toggle but only on login/legal/status pages — dashboard uses Sidebar only.

## Change — only `frontend-user/src/components/Sidebar.jsx`
1. Sidebar fixed container (line 245): add `display:"flex", flexDirection:"column"`
2. Scroll div (line 285): `height:"100%"` → `flex:"1 1 auto", minHeight:0` (keep overflowY auto, padding, transform/transition as-is)
3. Remove spacer `<div style={{ flex: 1, minHeight: "40px" }} />` (line 381)
4. MOVE lang-toggle div (383-414) + Sign Out div (416-432) OUT of the scroll div into a new sibling footer div placed right after the scroll div (inside the fixed container):
   ```jsx
   <div style={{
     flexShrink: 0,
     padding: expanded ? "12px 15px 18px" : "12px 8px 18px",
     borderTop: `1px solid ${C.border}`,
     background: C.navy,
   }}>
     {/* existing lang toggle block — same styles (marginBottom 15 stays) */}
     {/* existing Sign Out block — same styles */}
   </div>
   ```
5. Behavior: toggle + Sign Out always visible at sidebar bottom; only nav list scrolls; mobile drawer also gets bottom-pinned footer (container width 0 hides it when closed ✓).

## Not changed
Translations, Header.jsx, admin, backend. Button styles/labels ("EN"/"मराठी"/"मर") identical.

## Verify
`npx vite build` in `frontend-user` (EXIT=0).
