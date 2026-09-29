# Plan: DRP Card expand — paragraphs (backend) + "Open DPR Builder" button

**User decisions:** Button = **abhi placeholder** (kuch nahi karega). Content = **admin panel se dalega user** — admin side me description ka option dena. Model me abhi description field NHI hai → backend + admin + user teeno chahiye.

## 1. Backend (`backend/`) — Railway deploy REQUIRED
- **`models/DRPEntry.js`**: add `description: { type: String, default: "" }` (textarea content, paragraphs = Enter-separated)
- **`controllers/drpController.js`**:
  - `adminCreate` (~line 140): destructure `description` + `DRPEntry.create` me include
  - `adminUpdate` (~line 177): `if (description !== undefined) entry.description = description;`
  - Read endpoints (`getDRPEntries`, `adminGetAll`) full doc return karte hain → no change
- Verify: `node --check` both files
- ⚠️ **Railway deploy ke bina schema me field nahi hai → mongoose description strip kar dega** (deploy pending list me add)

## 2. `frontend-admin/src/pages/DRPLibraries.jsx` — description input
- `emptyForm` (line 22): `description: ""`
- `openEdit` (line 95): `description: entry.description || ""`
- `handleSave`: `...form` spread already hai → description auto-pass ✓
- Form UI: Tags ke baad **`gridColumn: "span 2"` textarea**:
  - Label: `Description (paragraphs)` — hint: "Har naye paragraph ke liye Enter dabao"
  - `rows=5`, `resize: vertical`, placeholder guidance
- Build: `npx vite build` (frontend-admin)

## 3. `frontend-user/src/components/DRPLibrary.jsx` — card expand (accordion)
- State: `const [expandedId, setExpandedId] = useState(null)` — ek saath sirf ek card khula (card click = toggle; doosra click kholne par pehla band)
- `DRPCard` props: `expanded={expandedId === entry.variantId}` + `onToggle`
- Card root `onClick={onToggle}` (cursor pointer pehle se hai)
- **Visual cue**: card ke andar bottom hint row — `▼ View details` / jab expanded `▲ Close` (chhota gray text, dotted top border) — marathi inline
- **Expanded section** (card ke bottom, tags ke baad, conditional render):
  - `borderTop: 1px dashed #e5e7eb`, padding top
  - **Paragraphs**: `entry.description.split(/\n+/).filter(Boolean).map(...)` → `<p>` (13px, `#4b5563`, lineHeight 1.7, textAlign left)
  - **Fallback** jab description khali: mr `"या प्रोजेक्टचा सविस्तर तपशील लवकरच उपलब्ध होईल."` / en `"Detailed project information will be available soon."`
  - **Button `🔧 Open DPR Builder`** (exact English text) — placeholder: `onClick={(e) => e.stopPropagation()}` (no-op, card collapse nahi hoga), brand orange bg, white, radius 8, bold, full-width ya inline-left
- Build: `npx vite build` (frontend-user)

## Not changed
- Seed data (description admin bharega), DRP API routes, filters/search/split-layout/scrollbar CSS

## Verify
- `node --check` backend (EXIT 0), `npx vite build` both apps (EXIT 0)
- Flow: admin me entry edit → description save → (Railway deploy) → user card click → paragraphs + button dikhe; button click se card collapse nahi hota
