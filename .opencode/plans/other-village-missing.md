# Plan: "Other" village users missing from village modal + PDF download

## Symptom (user)
Jis user ne village me **"Other"** choose kiya (custom village type kiya) — uska data village modal me show nahi hota → PDF download me bhi nahi.

## Root cause (backend mismatch — `backend/controllers/adminController.js`)

**Reports grouping** (`getReports`, line 398) display name banate waqt normalize karta hai:
```js
const village = (addr.village === "__other__" ? (addr.villageCustom || "Other") : addr.village) || "Unknown";
```
→ Reports chart me entry dikhti hai: **custom name** (e.g. "Naya Gaon") ya "Other".

**But village detail fetch** (`getVillageDetail`, line 465) **raw value** se match karta hai:
```js
if (addr.dist === dist && addr.taluka === taluka && addr.village === village)
```
→ Query param = `"Naya Gaon"` (custom name), par `addr.village` = `"__other__"` → **match hi nahi hota** → Other users modal/PDF me missing.

Same mismatch **"Unknown"** fallback ke liye bhi (group me `"Unknown"`, match me `undefined`).

## Fix (single point, backend)

`getVillageDetail` — wahi normalization jo `getReports` karta hai:
```js
const distN = addr.dist || "Unknown";
const talukaN = addr.taluka || "Unknown";
const villageN = (addr.village === "__other__" ? (addr.villageCustom || "Other") : addr.village) || "Unknown";
if (distN === dist && talukaN === taluka && villageN === village) { ... }
```
- Koi frontend change nahi (Reports.jsx / api.js already `encodeURIComponent` + group ke hisaab se URL bhej rahe hain)
- Export/other endpoints already normalize karte hain (line 199/570, exportController:34) — sirf `getVillageDetail` chhoot gaya tha

## Edge cases covered
- `__other__` + custom name present → custom name group vs `__other__` match ❌ → ab normalize ✅
- `__other__` + empty `villageCustom` → group "Other" vs raw "__other__" ❌ → ab "Other" ✅
- Missing dist/taluka/village → group "Unknown" vs undefined ❌ → ab "Unknown" ✅
- Do gaon same custom name → dono ek hi group (acceptable, waise bhi same naam ke villages)

## Steps
1. Edit `backend/controllers/adminController.js` → `getVillageDetail` matching block (line ~465)
2. Verify: node one-liner script (read-only, local Mongo `gav_tithe_db`) — ek `__other__` form ke liye purana vs naya logic match count
3. **Deploy: Railway (backend) required** — Vercel nahi (koi frontend change nahi)
