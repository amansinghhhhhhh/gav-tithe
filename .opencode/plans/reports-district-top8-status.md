# Plan: Reports — District Top 8 + Show all, Y-axis overlap fix, Not Started in Status

## Req (user)
1. **District chart me bhi Show all** — default sirf **Top 8** (baaki taluka/village jaisa toggle)
2. **"Chhatrapati Sambhaji Nagar" overlap** — district Y-axis label chhota/padded, **gap chahiye**
3. **Status Overview me "Not Started" bhi** — abhi sirf Submitted + Draft dikh rahe (baaki 0 hain aur `value > 0` filter hai)

## File
Sirf `frontend-admin/src/pages/Reports.jsx` (backend change nahi — Not Started client-side aayega)

## Changes

### 1. District — Top 8 + Show all
- `const [showAllDistrict, setShowAllDistrict] = useState(false)`
- `const districtSource = showAllDistrict ? byDistrict : byDistrict.slice(0, 8)` → `districtChart = districtSource.map(...)` (`byDistrict` already count-desc sorted)
- `showAllToggle` generalize: `(listLen, showAll, setShowAll, topN = 15)` — condition `listLen > topN`, label `` showAll ? `Top ${topN}` : `Show all (${listLen})` ``
- District Card: `action={showAllToggle(byDistrict.length, showAllDistrict, setShowAllDistrict, 8)}` (taluka/village wale default 15 par rehte hain)
- Show-all par district chart ko scroll wrapper me (`maxHeight: 560, overflowY: auto`) — bilkul taluka/village jaisa
- Reset useEffect me `showAllDistrict` **mat** add karo (district list drill se change nahi hoti)

### 2. Overlap fix (gap)
- **District YAxis**: `width: 115 → 165`, tick `fontSize 12 → 11` → "Chhatrapati Sambhaji Nagar" (~25 chars) fit + natural gap
- **Taluka YAxis (same problem aayegi)**: label = `${taluka} (${dist})` — `selectedDist` hone par **suffix hatao** (title me district already hai → sirf `taluka`) + `width: 150 → 165`, fontSize 11
- Village labels short — untouched

### 3. Status Overview — Not Started
- `const notStarted = Math.max(0, summary.totalUsers - (totalSubmitted + totalApproved + totalRejected + totalUnderReview + totalDraft))` (users with no form / form not_started)
- `statusAll` = 6 entries: Submitted, Approved, Rejected, Under Review, Draft + **`{ name: "Not Started", value: notStarted, color: "#94a3b8" }`**
- **Donut (pieData)**: `statusAll.filter(s => s.value > 0)` — zero slices mat dikhao (`paddingAngle` se gaps/artifacts bante)
- **Legend**: `statusAll` **poora** — hamesha 6 rows (0 wale bhi `0 · 0%` dikhega, report complete lagega)
- Center: value = `statusAll` sum (= totalUsers), label **"Total Forms" → "Total Users"**
- Empty state: `pieData.length === 0` (i.e., koi user hi nahi)
- Stats strip cards untouched (user ne sirf Status Overview kaha)

## Verify
- `npx vite build` (frontend-admin) → EXIT=0
- Bundle check: `Top 8|Not Started|Total Users` strings
- Deploy: Vercel (frontend-admin)
