# Plan: User-side Profile tab (sidebar me "Profile" — abhi broken)

## Req
User: "profile tab hai user side me uska kaam karte hain".
Confirmed: **Basic info card + Application/KYC status**. Logout button **nahi**. Edit-profile **nahi** (backend endpoint nahi chahiye).

## Current state (researched)
- Sidebar me `key: "profile"` hai (icon Profile.svg) par **App.jsx me branch hi nahi** → click = My Journey form dikhta hai (bug)
- **Koi Profile component nahi**, profile translation keys nahi, backend profile endpoint ki zaroorat nahi (read-only data sab available hai)
- Data sources (sab existing APIs, **zero backend change except 1 line**):
  - `useAuth().user` → name, email, mobile, emailVerified, role (getMe)
  - `getMyForm()` → uniqueId, status, section1 (fullName/address), section4.docs (10 KYC), createdAt, adminRemark, editAllowed
  - `getEditRequest()` → edit request status (pending/approved)

## Changes

### 1. NEW `frontend-user/src/components/ProfilePage.jsx`
Layout (mobile-first, app style C.navy/C.orange, DRPLibrary hero pattern):

**A. Header card** (navy gradient, radius 16):
- Avatar: circle initials (name ka pehla letter, orange bg)
- Name, mobile, email + **verified badge** (green ✓ jab `emailVerified`, warna gray "Not verified")
- `Member since` date (format `dd MMM yyyy`)

**B. Application status card** (white):
- Application ID (`uniqueId`) + **copy button** (`navigator.clipboard`, "Copied!" toast 1.5s) — ya "Not generated yet" jab null
- Status badge — ProfilePage ke andar hi status map (lang-aware, StatusCheckPage ka STATUS_MAP duplicate chhota):
  - draft (grey) / submitted (orange) / under_review (purple) / approved (green) / rejected (red)
- `adminRemark` jab rejected (red note box)
- Edit request status line (jab `getEditRequest` se pending/approved aaye)
- Form na bhi ho → "Application not started" empty state + CTA button → `onGoForm()` (My Journey)
- Form hai toh: education, village/taluka/dist summary rows (section1 se)

**C. KYC documents card** (white):
- Header: `KYC Documents` + progress `X / 10 uploaded` + thin progress bar
- Grid (mobile 1 col → desktop 2-3 col): 10 docs:
  aadhaarFront, aadhaarBack, pan, udyam, passport, bankPassbook, educationCert, casteCert, landDoc, electricityBill
- Har item: label (existing `s4_doc_*` translation keys reuse — check bankPassbook/educationCert/casteCert/landDoc/electricityBill keys, missing ho toh add karna), status chip:
  - ✓ Uploaded (green bg) / ○ Pending (grey bg)
- `getMyForm` loading → Spinner (existing `Spinner` component)

Props: `{ onGoForm }` (CTA ke liye). Data: `useEffect` me `getMyForm()` + `getEditRequest()` (parallel, doable).

### 2. `App.jsx` — branch add karo
```jsx
) : activeNav === "profile" ? (
  <ProfilePage onGoForm={() => setActiveNav("my_journey")} />
) : 
```
`dpr_library` branch ke baad, `submitted && !state.editAllowed` se **pehle** (profile submission state se independent dikhna chahiye).

### 3. `translations.js` — naye keys (mr dict + en dict dono)
~18 keys (both langs): `profile_title`, `profile_member_since`, `profile_not_verified`, `profile_app_id`, `profile_copy`/`profile_copied`, `profile_status_*` (5), `profile_not_started`, `profile_start_cta`, `profile_kyc_title`, `profile_kyc_progress`, `profile_uploaded`, `profile_pending`, `profile_edit_req_pending`, `profile_edit_req_approved`, `profile_remark`, missing s4_doc_* labels (check karo).

### 4. KYC label check
`Section4.jsx` me 10 docs ke labels existing `s4_doc_*` keys se aate hain — ProfilePage wahi keys reuse karega (sirf un 5 keys ko add karna pad sakta hai jo Section4 me hardcoded/missing hain — execution me verify).

## Responsive (mobile)
- Header card: avatar row stack (avatar + name), email wrap
- KYC grid: 1 col ≤640, 2 col ≤1024
- Copy button tap-friendly (44px)
- StatusCheckPage STATUS_MAP ko export karke reuse **na** karo (wahan English-only hai) — ProfilePage me lang-aware map

## Verify
- `npx vite build` (frontend-user) → EXIT=0
- Bundle me `profile_app_id` / ProfilePage marker check
- Manual: sidebar Profile → page dikhe; copy button; CTA → My Journey

## Deploy
- Vercel (frontend-user) — pending batch me
