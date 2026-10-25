# PROPOSAL — GTU Digital Platform

## Response to Software Requirements Specification (SRS), Architecture Feedback & Phased Delivery Plan

| | |
|---|---|
| **To** | Mr. Rameshwar Pawar, President — Udyog Vichar Manch / Gaon Tithe Udyojak Abhiyan |
| **From** | Gaon Tithe Udyojak Digital Platform Development Team |
| **Date** | 24 October 2026 |
| **Re** | SRS for the GTU single-window digital platform — architecture feedback and phased delivery plan |
| **Reference** | SRS circulated by GTU Incubation Council (3-phase, 6-month roadmap) |

---

## 1. Executive Summary

We thank GTU Incubation Council for the detailed SRS. The specification outlines a comprehensive single-window digital platform covering registration, learning (LMS), artificial-intelligence assistance, district resource mapping, finance/scheme linkages, a marketplace, the Udyog Vichar Manch governance hierarchy and an incubator ERP.

This document provides:

1. **Architecture feedback** on the proposed technical design (Section 2)
2. **Phase 1 — already delivered**: the existing live portal, which covers a significant part of the SRS baseline (Section 3)
3. **Gap analysis**: SRS scope vs. current platform (Section 4)
4. **Phase 2 — SRS scope**: a 3-milestone, 6-month delivery plan mapped to the SRS phases (Section 5)
5. **Usage-based running costs** — AI API and SMS/OTP charges on the developer side, modelled at the **30,000-user target** (Section 6)
6. **Assumptions, exclusions and risks** (Sections 7–8)

**Headline — full SRS scope delivered in 6 months across three milestones. Platform running costs (AI API usage, SMS/OTP credits) are billed monthly on actual usage — estimated ≈ ₹6,500/month (incl. GST) at the 30,000-user target (Section 6).**

---

## 2. Architecture Feedback

We appreciate the SRS's forward-looking technical choices. Based on our experience building and operating the existing GTU portal, we recommend the following adjustments — they preserve the specification's intent while reducing cost, risk and time-to-launch.

### 2.1 Microservices → Modular Monolith (recommended)

The SRS proposes a microservices architecture. For the target scale (≈36,000 users, per Mission 2028) a **modular monolith** on the current Node.js/Express + MongoDB stack is the right engineering choice:

- Independent microservices multiply deployment, monitoring, authentication and data-consistency overhead with no measurable benefit at this scale.
- The existing codebase is already modular by domain (applications, DPR, assessment, Seva First, admin) — clean module boundaries are maintained so that any domain (e.g. Marketplace or AI Copilot) can be extracted into a standalone service later, should usage justify it.
- **Benefit:** lower build cost, faster delivery, simpler operations; the microservices migration path remains open (documented in the handover).

### 2.2 Native Android + iOS → PWA + Capacitor (recommended)

The SRS requests separate native Android and iOS applications. We recommend:

- A **Progressive Web App (PWA)** — installable from browser, works offline on low-end devices, zero store-approval dependency — plus
- **Capacitor** wrappers to publish the *same* React codebase to Google Play Store and Apple App Store.

**Benefit:** both stores covered from one codebase — approximately 50–60% saving in build and maintenance cost versus two native apps, with no functional loss for this feature set.

### 2.3 CIBIL Integration — dependency note

Direct CIBIL bureau-API access is available only to RBI-regulated entities (banks/NBFCs) or their contracted partners. Therefore:

- **In scope (Phase 2, Milestone 2):** scheme-fit engine and loan-readiness (debt-capacity) scoring — computed from application data, DPR financials and declared obligations. This delivers the SRS's credit-enablement objective without a blocked dependency.
- **Conditional add-on:** actual CIBIL report pulls can be added once GTU secures a bank/NBFC partnership; effort is small (integration layer) and will be quoted separately at that time.

### 2.4 AI Copilot ("AI Rider") — design note

- LLM-powered copilot (scheme suggestions, DPR assistance, business guidance) delivered via a leading LLM API (Google Gemini / OpenAI), grounded with **retrieval-augmented generation (RAG)** over the District Resource Engine, scheme database and DPR library so answers are specific to the entrepreneur's district and sector.
- Bilingual (Marathi/English), with rate-limits per user and human-in-the-loop framing for any financial guidance.
- **Token/API usage is billed at actuals** on a usage basis (see Section 6).

### 2.5 RBAC for the 50-30-15-7 hierarchy

The Udyog Vichar Manch structure (State 50 → District 30 → Taluka 15 → Village 7, plus Incubation Council roles) maps cleanly onto a **role-based access-control layer** on the existing authentication system: one permission matrix per module (approve/forward/view), hierarchical data scoping (state sees all districts; district sees its talukas; and so on), and full audit trails. No architectural change is required.

---

## 3. Phase 1 — Already Delivered (Existing Portal)

The following capabilities are **built, live and in production today**. They constitute Phase 1 of the engagement and are the foundation on which the SRS scope will be delivered. *(No additional cost — listed for scope credit and timeline credit.)*

| # | Delivered capability | Status |
|---|---|---|
| 1 | User authentication — mobile OTP + email, secure sessions, role-based admin access | Live |
| 2 | Single-window entrepreneur registration — 4-section application form, draft-save & resume, bilingual (English / मराठी) throughout | Live |
| 3 | Document upload & OCR — Aadhaar / PAN / Udyam auto-capture from uploaded documents (GridFS storage) | Live |
| 4 | Profile management with admin-controlled edit-request workflow | Live |
| 5 | Entrepreneurial aptitude assessment — 15-question bilingual battery, instant scoring, saved results, retake | Live |
| 6 | DPR Library — filterable by sector & investment band across all 36 districts of Maharashtra | Live |
| 7 | DPR Builder — guided bankable Detailed Project Report with PDF export | Live |
| 8 | District / Taluka / Village analytics reports with graphs + Excel export | Live |
| 9 | 36-district interactive heatmap of entrepreneurial activity | Live |
| 10 | Seva First Innovation Challenge — full application pipeline (wizard, file uploads, admin review, status tracking, public status check) | Live |
| 11 | Admin panel — users, applications, reports, DPR administration, Seva First review, dashboard | Live |
| 12 | Public application-status check, privacy policy & grievance-redressal pages, customer-care channel | Live |

**Impact on timeline:** because SRS baseline items (registration, documents, assessment foundation, reports, admin) are already delivered, the SRS's Phase 1 window (months 1–2) is reallocated to the District Resource Engine, LMS foundation and assessment expansion — compressing overall risk and bringing forward first value.

---

## 4. Gap Analysis — SRS Scope vs. Current Platform

| SRS section | Current status | Delivered in |
|---|---|---|
| Single-window registration & documents | **Delivered** | Phase 1 |
| Analytics, reports & district heatmap | **Delivered** | Phase 1 |
| Admin back-office & review workflows | **Delivered** | Phase 1 |
| Entrepreneurial assessment | **Partial** (15 Q) — psychometric expansion pending | Phase 2 · M1 |
| District Resource Engine | **To build** | Phase 2 · M1 |
| LMS (learning management) | **To build** | Phase 2 · M1 |
| AI Copilot (AI Rider) | **To build** | Phase 2 · M2 |
| FinTech — scheme-fit & credit engine | **Partial** (DPR financials + loan fields exist) | Phase 2 · M2 |
| Udyog Vichar Manch hierarchy (50-30-15-7) | **To build** | Phase 2 · M2 |
| Incubator ERP (incubation pipeline, mentors, reports) | **To build** | Phase 2 · M2 |
| Marketplace (catalogue, orders, payments, logistics) | **To build** | Phase 2 · M3 |
| B2B / networking hub | **To build** | Phase 2 · M3 |
| PWA + Android/iOS apps (Capacitor) | **To build** | Phase 2 · M3 |
| Security audit, performance testing, launch | **To build** | Phase 2 · M3 |
| Microservices architecture | **Revised** → modular monolith with documented extraction path (Section 2.1) | — |

---

## 5. Phase 2 — SRS Delivery Plan (6 Months, 3 Delivery Milestones)

### Milestone 1 — Foundation & District Resource Engine (Month 1–2)

- **District Resource Engine** — district → taluka → village resource repository (sectors, infrastructure, schemes, market linkages) with admin-managed data, public browse and reporting
- **100-entrepreneur tracker** — onboarding, progress dashboards and outcome tracking for the first 100 entrepreneurs per district cohort
- **LMS foundation** — course structure, video lessons (hosted), bilingual captions, enrolment and progress tracking, completion records
- **Assessment expansion** — psychometric battery extension (entrepreneurship dimensions: risk, persistence, leadership, financial literacy) with richer scoring reports
- **UX wireframes & designs** for all remaining SRS modules (AI Copilot, UVM hierarchy, Marketplace, apps) for client sign-off before build

### Milestone 2 — Intelligence, Finance & Governance (Month 3–4)

- **AI Rider (AI Copilot)** — bilingual conversational assistant: scheme discovery, DPR assistance, business guidance; grounded (RAG) on district resources, schemes and DPR library; usage analytics
- **DPR upgrade** — scoring/quality hints against bank parameters, richer financial projections
- **FinTech engine** — scheme-fit eligibility engine + loan-readiness (debt-capacity) score from application & DPR data *(CIBIL pull = conditional add-on, per Section 2.3)*
- **Incubator ERP** — incubation pipeline stages, application intake, mentor allocation, review calendars, cohort reports
- **Udyog Vichar Manch governance** — 50-30-15-7 role hierarchy, hierarchical RBAC, workflow approvals & forwarding, audit trail, per-level dashboards

### Milestone 3 — Marketplace, Apps & Launch (Month 5–6)

- **Marketplace** — seller onboarding (KYC fields), product catalogue, search & categories, cart & orders, Razorpay payments, Shiprocket shipping integration, order-status tracking, admin moderation
- **B2B / networking hub** — entrepreneur directory, enquiry routing, discussion/forum basics
- **PWA + mobile apps** — installable PWA; Android (Google Play) + iOS (App Store) builds via Capacitor
- **Quality** — security review (auth, inputs, uploads, API hardening), performance/load testing, UAT support
- **Launch** — production deployment, admin & user training documentation, handover

---

## 6. Running Costs (Usage-Based) — Basis: 30,000 Users

The developer-side running costs of the platform — third-party AI API usage and SMS/OTP credits — are **billed monthly on actual usage** (usage-based), with a monthly usage report. Server infrastructure is already provisioned (Hostinger KVM 2 VPS) and is **not billed** as part of these estimates. The estimate below is modelled on the project target of **30,000 registered users**.

**Estimation assumptions:** 30,000 registered users · ~10% daily active (~3,000 users/day) · ~30,000 SMS/OTP per month (registration, OTP logins, status alerts) · ~10,000 AI copilot sessions per month.

| # | Developer-end cost item | Basis at 30,000 users | Estimated ₹/month (incl. GST) |
|---|---|---|---|
| 1 | **AI API — AI Rider** (Google Gemini / OpenAI) | ~10,000 copilot sessions/month | **≈ ₹1,500** (range ₹500–4,000) |
| 2 | **SMS / OTP credits** | 30,000 messages × ₹0.1652 (incl. GST) | **≈ ₹4,956** |
| | **Estimated monthly total** | | **≈ ₹6,500** |

**Notes:**

- **SMS credit pack (actual rate):** ₹4,130 (incl. GST) per 25,000 SMS → ₹0.1652 per SMS (incl. GST). Pack is payable and consumption is directly proportional to real traffic.
- **DLT registration:** one-time ₹5,900 (incl. GST) — payable (one-time, not recurring).
- **AI API rate card (Oct 2026):** Gemini 3.1 Flash-Lite — $0.25 input / $1.50 output per 1M tokens; Gemini 3.8 Flash — $0.75 / $3.75 (doubles from 1 Jan 2027); OpenAI GPT-6 Luna — $0.10 / $0.50. Estimate uses Flash-Lite at ~3,000 input + ~600 output tokens per session. Gemini's free tier (rate-limited) can hold AI costs at ₹0 during the launch phase.
- **Server:** Hostinger KVM 2 VPS already provisioned — not billed in this estimate.
- **Billing model:** monthly wallet top-ups for SMS and AI credits, reconciled against actual usage with a usage report.
- **Scaling:** if usage materially exceeds the 30,000-user model (SMS volumes, AI sessions), a revised estimate will be proposed in writing before it is incurred.

---

## 7. Assumptions & Scope Clarifications

**In scope for delivery:** all design, development, testing, deployment of the listed scope; two revision rounds per milestone; 60-day bug-fix warranty per milestone; training documentation and handover.

**Running operational costs** — AI API usage and SMS/OTP credits — are billed usage-based monthly per **Section 6**; server infrastructure (Hostinger KVM 2) is already provisioned.

**Excluded from scope:**

| Item | Notes |
|---|---|
| Content | LMS video lessons, scheme data, DPR template content, photography/copy — provided by client |
| CIBIL bureau API | Enterprise quote; requires RBI-regulated partner (Section 2.3) — optional add-on |
| Revisions beyond 2 rounds/milestone | Billed at agreed time-and-materials rate |
| Marketplace statutory/compliance costs | Seller KYC verification, certifications — client-side statutory items |

---

## 8. Risks & Dependencies

| Risk / dependency | Mitigation |
|---|---|
| CIBIL API access requires RBI-regulated partner | Scheme-fit + debt-capacity engine in scope (delivers objective); CIBIL pulls added as optional add-on when partnership confirmed |
| LMS & marketplace content readiness | Content calendar agreed at M1 kick-off; delays shift the affected dates accordingly |
| App-store approval timelines (1–2 weeks each) | Account creation in Week 1 of M3; PWA launch is not dependent on approvals |
| AI output accuracy for financial guidance | RAG-grounded responses, disclaimers, human-in-the-loop for loan/scheme decisions; admin visibility of usage |
| Third-party service outages (payments, SMS, LLM) | Vendor abstraction layers; graceful degradation and retries |
| Compliance (DPDP Act 2023, marketplace KYC) | Privacy-by-design, consent flows, data-retention policy; legal review support provided |

---

## 9. Next Steps

1. GTU review of this proposal and confirmation of scope and the usage-based running-cost model
2. Sign-off of M1 scope + wireframes approach
3. Kick-off of Milestone 1 within 5 working days of approval

We look forward to building the next phase of the Gaon Tithe Udyojak digital platform together.

**— Gaon Tithe Udyojak Digital Platform Development Team**
