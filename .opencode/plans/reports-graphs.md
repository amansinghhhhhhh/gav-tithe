# Plan: Admin Reports page — graphs (recharts), tables hatao

## Requirement
`/reports` (`frontend-admin/src/pages/Reports.jsx`) abhi sirf summary cards + 3 tables dikhata hai. User: **graphs me dikhao, dekh kar samajh aaye** + **tables hata do** (sirf graphs). Library: **recharts** (user chose).

## Research
- Backend `GET /admin/reports` already data deta hai (koi change nahi chahiye):
  - `summary`: { totalUsers, totalSubmitted, totalApproved, totalRejected, totalUnderReview, totalDraft }
  - `byDistrict`: [{dist, count, submitted, approved, rejected}] count-desc sorted
  - `byTaluka`: [{dist, taluka, count, ...}], `byVillage`: [{dist, taluka, village, count, ...}]
- Interactions: district click → taluka filter, taluka click → village filter, village click → user-modal (`handleVillageClick`), `handleBack` resets — **ye states/modal abhi bhi kaam karenge** (charts par click se)
- Admin package.json me koi chart lib nahi; recharts v3 = React 19 compatible

## Steps

### 1. Install
`npm i recharts` (frontend-admin, latest v3)

### 2. `Reports.jsx` — tables → graphs

**Layout (top to bottom):**
1. **Summary cards (6)** — as-is rehenge (they are cards, not tables)
2. **Grid `1fr 1fr`:**
   - **Status Donut** card: recharts `<PieChart>` + `<Pie innerRadius={55} outerRadius={95} paddingAngle={2}>` data = summary se: Submitted(orange #F97316), Approved(#16a34a), Rejected(#dc2626), Under Review(#7c3aed), Draft(#6b7280); `<Tooltip>`; custom right-side legend (color dot + label + count + %); center me `totalForms` + "Total Forms". Data 0 wale slices rehne do (tooltip me dikhega) — sirf jinme count>0 ho unko hi dikhao optional: **>0 wale hi slices** (cleaner)
   - **District-wise bars** card: `<BarChart layout="vertical">`, data = `byDistrict` (sab, count-desc already), `label = renameDist(d.dist)`, `<YAxis type="category" width={110}>`, `<XAxis type="number">`, `<Bar dataKey="count" fill={C.navy} radius=[0,6,6,0]>` + `<LabelList dataKey="count" position="right">` (numbers visible) + custom tooltip (Total/Submitted/Approved/Rejected breakdown); **Bar click → `setSelectedDist(d.dist)`** (jaise row click tha); height = `Math.max(300, byDistrict.length * 26)`
3. **Grid `1fr 1fr`:**
   - **Taluka-wise bars**: data = `filteredTalukas.slice(0, 15)` (top 15; title me "(Top 15)" suffix jab full list > 15), label = `${renameTaluka(t.taluka)} (${renameDist(t.dist)})`, orange #F97316 bars; click → `setSelectedDist + setSelectedTaluka`; empty → "No data"
   - **Village-wise bars**: data = `filteredVillages.slice(0, 15)`, label = village (+ `, ${renameTaluka(taluka)}` jab all-villages view), green #16a34a bars; click → `handleVillageClick(...)` (existing modal); empty → "No data"
4. **Village detail modal + header Back button** — as-is (tables nahi hataye — ye detail view hai)

**Details:**
- `<ResponsiveContainer width="100%">` Card ke andar (Card `overflowX:auto` wrapper already hai)
- Custom `ChartTooltip` (white bg, navy border, 13px) — default recharts tooltip ganda lagta hai
- Card component me title suffix dynamic: `selectedDist ? \`Taluka-wise — ${renameDist(selectedDist)}\` : \`Taluka-wise Registration${n>15?" (Top 15)":""}\`` — maujooda onBack logic as-is
- District/taluka/village rows ke maujooda `<table>` blocks delete; `filteredTalukas/filteredVillages/handleVillageClick/handleBack` states as-is
- Import: `import { BarChart, Bar, Cell?, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Legend? } from "recharts"` (sirf jo use ho)

**Verify:**
- `npx vite build` (frontend-admin) → EXIT=0 + bundle me recharts/`Donut` strings check
- Deploy: Vercel (frontend-admin) — pending batch: dropdown fix + favicon + users pagination + ye reports
