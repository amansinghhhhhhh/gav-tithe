# Plan: Interactive DPR Builder (user side) + Generate DPR PDF

## Req (user spec — screens exactly as given)
DPR tab → card (e.g. "Curd Production (Variant 845)") → expanded → **Open DPR Builder** → 5-step wizard:
`Project Sizing → Operations → Subsidy & Loan → KYC Documents → Financial Preview → Generate DPR PDF`

**Current state (researched):**
- "🔧 Open DPR Builder" button exists in `DRPLibrary.jsx:1186` — **no onClick** (sirf stopPropagation). Wizard bilkul nahi hai.
- Entry fields available: `variantName, variantId, category, sector, investmentRange` ("₹0.5L - ₹2L"), `investmentMin/Max (lakhs), subsidyPercent, roi, jobs, tags, description`
- KYC: form docs = only 5 (`aadhaarFront, aadhaarBack, pan, udyam, passport`), `ALLOWED_DOC_TYPES` backend gate — spec wants **8 docs**
- Existing infra: `getMyForm()`, `uploadDoc(docType,file)/removeDoc`, `docFileUrl`; PDF stack `jspdf@4 + html2canvas` already in frontend-user; `FormPreview.jsx` proven PDF pattern (watermark 10%/-30°, page slicing); i18n = `translations.js {mr,en}` + `t(key)`
- **User decisions:** schemes = PMEGP(35%), PMFME(35%), CMEGP Maharashtra(25%), No Scheme/Self-funded(0%); UI text = **EN + MR**

## Files

### 1. NEW `frontend-user/src/components/DPRBuilder.jsx` (~600 lines)
Full-screen modal (backdrop blur, DRPLibrary colors `C`):
- Header: 🏗️ `t("dpr_title")` + subtitle `{variantName} (Variant {variantId}) — {category}`
- 5 step tabs (active navy / done green ✓ / click wapas sirf visited tak)
- State: `step, cost, own, rawCost, sales, scheme, docs, busyUp, pdfBusy` (close pe reset)

**Step 1 Project Sizing** — `Cancel` (onClose) | `Next`
- Total Estimated Project Cost (₹) — ph `e.g. 200000`, hint `Suggested range: {entry.investmentRange}`
- Own Contribution (Min 10%) (₹) — ph `e.g. 50000`, live `%` badge, error `Minimum 10% required` (own < 10% cost); own ≤ cost bhi validate
- Next valid: cost > 0 && own ≥ 10% of cost

**Step 2 Operations** — `Back` | `Next`
- Expected Monthly Raw Material Cost (₹) `e.g. 30000`; Estimated Monthly Sales / Revenue (₹) `e.g. 80000`
- Next valid: rawCost ≥ 0, sales > 0 (numbers); `sales > raw` check **final step par warning** (spec jaisa)

**Step 3 Subsidy & Loan** — `Back` | `Next`
- Select: `PMEGP (35% subsidy)` | `PMFME (35% subsidy)` | `CMEGP (Maharashtra) (25% subsidy)` | `No Scheme / Self-funded (0%)`
- Auto: `Subsidy = cost × pct/100`, `Bank Loan = max(0, cost − own − subsidy)`; compact ₹ format (`₹70.0K`, `₹1.10L` helper)

**Step 4 KYC Documents** — `Back` | `Next` (required complete hone par hi)
- `Upload KYC Documents` + `N/8` counter + hint (JPG/PNG/PDF, max 5MB, `*` required)
- 8 rows: Aadhaar*, PAN*, Bank Passbook (First Page)*, Passport Size Photo*, Education Certificate, Caste Certificate (if applicable), Land / Premises Document, Electricity Bill
- Pre-check open par `getMyForm()`: `aadhaarFront && aadhaarBack` → Aadhaar ✓, `pan` → PAN ✓, `passport` → Photo ✓ (form docs, read-only ✓)
- Baaki 5 naye docType — `uploadDoc(docType, file)` / `removeDoc` (green `✓ Uploaded` + Remove); required(4) pending ho to Next blocked; fetch fail → empty assume (try/catch)

**Step 5 Financial Preview** — `Back` | **`Generate DPR PDF`** (always enabled)
- Dashboard cards: Total Cost | Own (₹ + %) | Subsidy | Bank Loan | **Monthly Profit** (sales − raw) | **ROI** ((profit×12/cost)×100 %)
- `Documents uploaded: N/8`
- ⚠ box (jab invalid): `Sales must exceed raw material cost`, `ROI must be positive`
- `More about this DPR` toggle → `entry.description` paragraphs

**Generate DPR PDF** (FormPreview pattern — Devanagari-safe, proven):
- Hidden capture div (760px, system font): header (guicon + `DPR — {variantName}` + date), Project Sizing/Operations/Subsidy summary, KYC checklist ✓/✗, Financial dashboard
- `html2canvas(scale 2)` → `jspdf` A4 slice loop, guicon watermark 10% −30°, footer `Page X / Y`, save `dpr_<slug(variant)>_<variantId>.pdf` (dynamic imports, `pdfBusy` → "Generating...")

### 2. `frontend-user/src/components/DRPLibrary.jsx`
- `const [builderEntry, setBuilderEntry] = useState(null)`
- Button (line 1168): `onClick={(e) => { e.stopPropagation(); setBuilderEntry(entry); }}`
- `{builderEntry && <DPRBuilder entry={builderEntry} onClose={() => setBuilderEntry(null)} />}`

### 3. `frontend-user/src/constants/translations.js`
~45 naye keys `dpr_*` **dono dict (mr + en)**: steps, labels, placeholders, hint, errors, buttons, scheme names, dashboard, warnings, upload text, PDF strings.

### 4. Backend (Railway deploy)
- `backend/controllers/formController.js:8` — `ALLOWED_DOC_TYPES += ["bankPassbook","educationCert","casteCert","landDoc","electricityBill"]`
- `backend/models/FormDatschema` — `section4.docs` me 5 naye `Mixed default null` fields
- OCR branch untouched (sirf aadhaarFront/pan/udyam); delete/reupload logic generic ✓
- Note: ye docs form Section4 me bhi dikhne lagenge (same storage) — intended

## Verify
1. `node --check backend/controllers/formController.js` + model file
2. `npx vite build` (frontend-user) → EXIT=0 + bundle me `Interactive DPR Builder` string
3. Local flow check: builder open → steps → validation errors → upload (local mongo/backend) → PDF generate
4. Deploy: **Vercel (frontend-user) + Railway (backend)** — dono required

## Out of scope (jaan-boojh kar)
- Builder values ka backend save/draft (session-only, spec me nahi)
- Admin DocumentView me naye 5 docs ka UI (storage me honge; UI alag se)
- entry.subsidyPercent ka use (scheme dropdown decide karta hai %)
