# Plan: Admin /users — 50 users per page (pagination)

## Requirement
`frontend-admin` ke `/users` (UsersList) page par ek baar me sirf **50 user** dikhein. User chose: **Pagination controls** (Prev/Next, page 1 par reset).

## Current state (research)
- `UsersList.jsx` saare users `filtered.map(...)` se render karta hai — no slicing
- `getAllUsers()` → `GET /admin/users` pura list deta hai (backend me koi pagination nahi)
- Admin me kahin bhi pagination pattern nahi — sirf Dashboard `slice(0,5)` (unrelated)
- **Decision: client-side pagination** — backend/Vercel API change ki zarurat nahi; data already in memory

## Change — `frontend-admin/src/pages/UsersList.jsx` (sirf yahi file)
1. Constants + state:
   ```js
   const PAGE_SIZE = 50;
   const [page, setPage] = useState(1);
   ```
2. `filtered` logic as-is (search + status filter unchanged), then:
   ```js
   const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
   const safePage = Math.min(page, totalPages);           // delete/filter se list chhoti ho to clamp
   const startIndex = (safePage - 1) * PAGE_SIZE;
   const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
   ```
3. Table body: `filtered.map` → **`pageItems.map`**; `#` column `{i + 1}` → **`{startIndex + i + 1}`** (global numbering, page 2 = 51 se shuru)
4. Search input `onChange` aur status `<select>` `onChange` me **`setPage(1)`** (filter change → page 1 reset)
5. Table card ke neeche pagination bar (sirf jab `filtered.length > 0` aur `totalPages > 1`):
   - Style: white bg, `borderTop: "1px solid #f0f0f0"`, `padding: 12px 16px`, `display:flex, justify-content: space-between, align-items:center, flexWrap`
   - Left: `Showing {startIndex + 1}–{startIndex + pageItems.length} of {filtered.length}` (13px, `C.textopa`)
   - Right: `‹ Prev` button + `Page {safePage} of {totalPages}` + `Next ›` button — buttons navy text on `C.light` bg, disabled state grey (`opacity .45, cursor default`), borderRadius 8, fontSize 13, fontWeight 600
6. `handleDelete` waise hi; list shrink hone par `safePage` clamp automatically page 1 par/last page par le aayega
7. Loading/empty states unchanged ("No users found" row); pagination bar tab hidden

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Deploy: Vercel (frontend-admin)
