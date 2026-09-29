# Plan: DRP Library data not showing — Root Cause + Fix

## Root Cause (research done)

**Seed HUA THA — but 2 jagah data ka status alag hai:**

1. **Localhost (user's current dev setup — Vite is running, backend is NOT):**
   - Vite dev server ON (`npm run dev`), **backend `node server.js` (port 5000) DOWN** → `GET http://localhost:5000/api/drp` = connection refused
   - `apiFetch` returns `success:false` → `DRPLibrary` `if (res.success)` fails → `entries = []` → **empty page**
   - Local MongoDB (mongod IS running) has **24/24 active DRP entries ✅** (verified via node count) + 2 users
   - So data seed ho chuka hai, backend bas chal nahi raha

2. **Production (Vercel → Railway → Atlas):**
   - `GET https://gav-tithe-production.up.railway.app/api/drp` → **COUNT = 1** (only "Soap Manufacturing / Mumbai")
   - Prod DB = Atlas `gav_tithe_db` (Railway MONGO_URI); local seed went to **localhost** (`backend/.env` has `MONGO_URI=mongodb://localhost:27017/gav_tithe_db`, Atlas line is commented)
   - Deployed site par sirf **1 entry** dikhegi → "data show nahi ho raha"

No code bug — frontend/backend logic is fine (`isActive` default true, filters default "All", response shape matches).

## Fix Steps

### Step 1 — Start local backend (localhost fix)
- `Start-Process node -ArgumentList server.js -WorkingDirectory backend` (detached, survives session)
- Verify: `GET http://localhost:5000/api/drp` → expect **COUNT=24**
- Localhost app DRP library me 24 entries dikhne lagenge (no rebuild needed)

### Step 2 — Seed PROD (Atlas) DB (deployed-site fix)
- Run **`node seedDRP.js` with env-override** — NO .env file edit:
  - PowerShell: extract commented `# MONGO_URI=...` (Atlas URI) from `backend/.env` → set `$env:MONGO_URI` (dotenv does not override pre-set env vars) → `node seedDRP.js` → never print the URI
  - Upsert by unique `variantId` → existing prod entry 1045 gets updated, no duplicates
- Verify: prod API `GET /api/drp` → expect **COUNT=24** (this also confirms Railway uses same Atlas DB)
- **No Railway deploy needed** (data-only fix), no Vercel deploy needed

## Notes / optional (not in scope unless asked)
- District filter mismatch: seed `location: "Mumbai"` but dropdown district keys are `"Mumbai City"`/`"Mumbai Suburban"` — Mumbai filter would return 0; other locations (Kolhapur, Nashik, etc.) are valid district keys. Optional follow-up.
- Suggestion for user: backend alag se chalana padta hai — `npm run dev` sirf Vite chalata hai (concurrently option possible later).

## Verify
1. Local: `Invoke-WebRequest http://localhost:5000/api/drp` → count 24; browser localhost DRP page shows cards
2. Prod: `Invoke-WebRequest ...railway.app/api/drp` → count 24; deployed DRP page shows 24 cards
3. No build/deploys involved
