import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { submitSevaApplication, getMySevaApps, apiMsg } from "../services/api";
import { Spinner } from "../components/shared/Spinner";

const BRAND = {
  orange: "#e65100",
  saffron: "#f57c00",
  lightOrange: "#fff3e0",
  green: "#2e7d32",
  lightGreen: "#e8f5e9",
  dark: "#1b2a4a",
};

const PPT_TEMPLATE_URL =
  "https://www.sevainnovationchallenge.in/assets/Seva-First-Innovation-Challenge-PPT-Template.pptx";

const CATS = [
  { v: "Agriculture & Agrotech", k: "seva_cat_agri" },
  { v: "Rural Handicraft & Manufacturing", k: "seva_cat_handicraft" },
  { v: "Renewable Energy & Environment", k: "seva_cat_energy" },
  { v: "Education & Employability", k: "seva_cat_education" },
  { v: "Healthcare & Sanitation", k: "seva_cat_health" },
];

const STEPS = [
  { lbl: "seva_step1_lbl" },
  { lbl: "seva_step2_lbl" },
  { lbl: "seva_step3_lbl" },
  { lbl: "seva_step4_lbl" },
];

const FIELD_BASE = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: "1.5px solid #cbd5e1",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const LABEL = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 800,
  color: "#374151",
  textTransform: "uppercase",
  marginBottom: 6,
  letterSpacing: "0.3px",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

function SectionHead({ title, sub }) {
  return (
    <div style={{ borderBottom: "1.5px solid #e5e7eb", paddingBottom: 12, marginBottom: 22 }}>
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>{title}</h3>
      <p style={{ fontSize: 12, color: "#6b7280", marginTop: 5 }}>{sub}</p>
    </div>
  );
}

const emptyForm = () => ({
  applicantName: "",
  mobile: "",
  email: "",
  location: "",
  aadhaar: "",
  pan: "",
  teamMembers: [],
  category: "",
  problem: "",
  solution: "",
  cost: "",
  timelineMonths: "",
  implementationPlan: "",
  videoLink: "",
});

const STATUS_BADGE = {
  submitted: { bg: "#fff7ed", color: "#F97316", label: "seva_under_review" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "seva_under_review" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "choice_status_approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "choice_status_rejected" },
};

export default function SevaFirstPage() {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm());
  const [files, setFiles] = useState({ ppt: null, idProof: null, prototype: null, research: null });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [ack, setAck] = useState(null);
  const [myApps, setMyApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const applyRef = useRef(null);

  const loadApps = async () => {
    const res = await getMySevaApps().catch(() => null);
    if (res?.success) setMyApps(res.applications || []);
    setLoadingApps(false);
  };

  useEffect(() => {
    loadApps();
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const showErr = (m) => {
    setMsg("❌ " + m);
    setTimeout(() => setMsg(""), 4000);
  };

  const validateStep = () => {
    if (step === 1) {
      const f = form;
      if (!f.applicantName.trim() || !f.mobile.trim() || !f.email.trim() || !f.location.trim() || !f.aadhaar.trim())
        return showErr(t("seva_err_step1")), false;
      if (!/^\d{10}$/.test(f.mobile.trim())) return showErr(t("seva_err_mobile")), false;
      if (!/^\d{12}$/.test(f.aadhaar.trim())) return showErr(t("seva_err_aadhaar")), false;
    } else if (step === 2) {
      if (!form.category || !form.problem.trim() || !form.solution.trim()) return showErr(t("seva_err_step2")), false;
    } else if (step === 3) {
      const cost = Number(form.cost);
      const tl = Number(form.timelineMonths);
      if (!cost || cost < 1000 || !tl || tl < 1 || tl > 60 || !form.implementationPlan.trim())
        return showErr(t("seva_err_step3")), false;
    }
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(4, s + 1));
  };
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const onFile = (key, file, maxMB) => {
    if (!file) {
      setFiles((f) => ({ ...f, [key]: null }));
      return;
    }
    if (file.size > maxMB * 1024 * 1024) {
      showErr(`${file.name}: max ${maxMB}MB`);
      return;
    }
    setFiles((f) => ({ ...f, [key]: file }));
  };

  const handleSubmit = async () => {
    if (!files.ppt || !files.idProof) return showErr(t("seva_err_files"));
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("applicantName", form.applicantName.trim());
      fd.append("mobile", form.mobile.trim());
      fd.append("email", form.email.trim());
      fd.append("location", form.location.trim());
      fd.append("aadhaar", form.aadhaar.trim());
      fd.append("pan", form.pan.trim().toUpperCase());
      fd.append("teamMembers", JSON.stringify(form.teamMembers));
      fd.append("category", form.category);
      fd.append("problem", form.problem.trim());
      fd.append("solution", form.solution.trim());
      fd.append("cost", form.cost);
      fd.append("timelineMonths", form.timelineMonths);
      fd.append("implementationPlan", form.implementationPlan.trim());
      fd.append("videoLink", form.videoLink.trim());
      fd.append("ppt", files.ppt);
      fd.append("idProof", files.idProof);
      if (files.prototype) fd.append("prototype", files.prototype);
      if (files.research) fd.append("research", files.research);

      const res = await submitSevaApplication(fd);
      if (res.success) {
        setAck({ uniqueId: res.uniqueId });
        setForm(emptyForm());
        setFiles({ ppt: null, idProof: null, prototype: null, research: null });
        setStep(1);
        loadApps();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showErr(apiMsg(res, t));
      }
    } catch (err) {
      showErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Acknowledgement screen ─────────────────────────────────────────────────
  if (ack) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', 'Noto Sans Devanagari', sans-serif" }}>
        <div style={{ background: BRAND.orange, color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: 13, fontWeight: 600 }}>
          {t("seva_announce")}
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 20px" }}>
          <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.08)", padding: "44px 34px", textAlign: "center" }}>
            <div style={{ fontSize: 56 }}>🎉</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "14px 0 8px", lineHeight: 1.35 }}>{t("seva_ack_title")}</h1>
            <p style={{ fontSize: 14, color: "#6b7280", marginTop: 22 }}>{t("seva_ack_sub")}</p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: BRAND.lightGreen,
                border: `2px solid ${BRAND.green}`,
                borderRadius: 12,
                padding: "12px 22px",
                margin: "10px 0 24px",
              }}
            >
              <span style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 800, color: BRAND.green, letterSpacing: "1px" }}>
                {ack.uniqueId}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(ack.uniqueId);
                }}
                style={{ background: BRAND.green, color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                {t("seva_ack_copy")}
              </button>
            </div>
            <div style={{ margin: "6px 0 8px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#ede9fe", color: "#7c3aed", padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed" }} />
                {t("seva_under_review")}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", background: "#f3f4f6", borderRadius: 10, padding: "12px 16px", marginTop: 20, lineHeight: 1.6 }}>
              {t("seva_ack_note")}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 26, flexWrap: "wrap" }}>
              <button
                onClick={() => setAck(null)}
                style={{ background: "#fff", color: BRAND.orange, border: `2px solid ${BRAND.orange}`, borderRadius: 12, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                {t("seva_btn_apply_now")}
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                style={{ background: BRAND.orange, color: "#fff", border: "none", borderRadius: 12, padding: "12px 26px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
              >
                {t("seva_ack_back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ──────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", fontFamily: "'Segoe UI', 'Noto Sans Devanagari', sans-serif", color: "#1f2937" }}>
      {/* Announcement bar */}
      <div style={{ background: BRAND.orange, color: "#fff", padding: "9px 16px", fontSize: 12.5, fontWeight: 600, textAlign: "center" }}>
        {t("seva_announce")}
      </div>

      {/* Mini nav */}
      <div style={{ background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 42, height: 42, borderRadius: 12, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.saffron})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800 }}>💡</span>
            <div>
              <span style={{ fontSize: 10.5, fontWeight: 800, background: "#dcfce7", color: "#166534", padding: "2px 9px", borderRadius: 12, textTransform: "uppercase" }}>{t("seva_badge_gtu")}</span>
              <h1 style={{ fontSize: 16.5, fontWeight: 900, color: "#111827", margin: "2px 0 0", lineHeight: 1.2 }}>{t("seva_hero_title")}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a href="#seva-about" style={{ fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none" }}>{t("seva_nav_about")}</a>
            <a href="#seva-docs" style={{ fontSize: 13, fontWeight: 600, color: "#374151", textDecoration: "none" }}>{t("seva_nav_docs")}</a>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "#fff", color: BRAND.orange, border: `1.5px solid ${BRAND.orange}`, borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              {t("seva_btn_back")}
            </button>
            <a
              href="#seva-apply"
              style={{ background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.saffron})`, color: "#fff", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none" }}
            >
              {t("seva_btn_apply_now")}
            </a>
          </div>
        </div>
      </div>

      {/* Toast */}
      {msg && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "11px 20px", borderRadius: 10, fontWeight: 600, fontSize: 13.5, boxShadow: "0 4px 14px rgba(0,0,0,0.12)", maxWidth: 380 }}>
          {msg}
        </div>
      )}

      {/* Hero */}
      <div
        style={{
          background: `linear-gradient(rgba(13,27,56,0.85), rgba(230,81,0,0.75)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80') center/cover no-repeat`,
          color: "#fff",
          padding: "64px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, padding: "7px 18px", fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
            <span style={{ color: "#4ade80" }}>🌱</span> {t("seva_hero_tagline")}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 900, lineHeight: 1.15, margin: 0 }}>
            {t("seva_hero_title")}
            <br />
            <span style={{ color: "#fcd34d", fontSize: "0.62em" }}>{t("seva_hero_subtitle")}</span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "#e5e7eb", maxWidth: 700, margin: "20px auto 0", lineHeight: 1.7 }}>{t("seva_hero_desc")}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            <a
              href="#seva-apply"
              style={{ background: BRAND.orange, color: "#fff", fontWeight: 800, fontSize: 15, padding: "14px 30px", borderRadius: 14, textDecoration: "none", boxShadow: "0 6px 20px rgba(230,81,0,0.45)" }}
            >
              🚀 {t("seva_hero_cta")}
            </a>
            <a
              href={PPT_TEMPLATE_URL}
              target="_blank"
              rel="noreferrer"
              style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", fontWeight: 700, fontSize: 15, padding: "14px 26px", borderRadius: 14, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              ⬇ {t("seva_hero_template")}
            </a>
          </div>
        </div>
      </div>

      {/* About */}
      <div id="seva-about" style={{ background: "#fff", padding: "50px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
          <span style={{ background: BRAND.lightOrange, color: BRAND.orange, fontSize: 11, fontWeight: 800, padding: "5px 14px", borderRadius: 16, textTransform: "uppercase", letterSpacing: "0.6px" }}>{t("seva_need_badge")}</span>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "12px 0 6px" }}>{t("seva_need_title")}</h2>
          <p style={{ color: "#6b7280", fontSize: 14, maxWidth: 620, margin: "0 auto 30px" }}>{t("seva_need_sub")}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, textAlign: "left" }}>
            {[
              { icon: "💼", title: t("seva_card1_title"), desc: t("seva_card1_desc") },
              { icon: "🏙️", title: t("seva_card2_title"), desc: t("seva_card2_desc") },
            ].map((card) => (
              <div key={card.title} style={{ border: "1px solid #e5e7eb", borderLeft: `4px solid ${BRAND.orange}`, borderRadius: 16, padding: 24, display: "flex", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <span style={{ width: 48, height: 48, borderRadius: 12, background: BRAND.lightOrange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{card.icon}</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: 0 }}>{card.title}</h3>
                  <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8, lineHeight: 1.65, margin: "8px 0 0" }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents checklist */}
      <div id="seva-docs" style={{ background: "#f3f4f6", padding: "50px 20px" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
            <div>
              <span style={{ background: BRAND.lightGreen, color: BRAND.green, fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 8, textTransform: "uppercase" }}>{t("seva_nav_docs")}</span>
              <h2 style={{ fontSize: 23, fontWeight: 900, color: "#111827", margin: "10px 0 4px" }}>{t("seva_doc_title")}</h2>
            </div>
            <a href={PPT_TEMPLATE_URL} target="_blank" rel="noreferrer" style={{ background: BRAND.green, color: "#fff", padding: "11px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              ⬇ {t("seva_hero_template")}
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, transition: "border .15s" }}>
                <div style={{ color: BRAND.orange, fontWeight: 900, fontSize: 14, marginBottom: 5 }}>{i}. {t(`seva_req${i}_title`)}</div>
                <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{t(`seva_req${i}_desc`)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Apply wizard ── */}
      <div id="seva-apply" ref={applyRef} style={{ background: "#fff", padding: "54px 20px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: 0 }}>{t("seva_form_heading")}</h2>
            <p style={{ color: "#6b7280", fontSize: 14, marginTop: 8 }}>{t("seva_form_sub")}</p>
          </div>

          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 560, margin: "0 auto 34px", position: "relative" }}>
            <div style={{ position: "absolute", top: 18, left: 30, right: 30, height: 3, background: "#e5e7eb", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: 18, left: 30, height: 3, background: BRAND.orange, borderRadius: 2, width: `${((step - 1) / 3) * 100}%`, maxWidth: "calc(100% - 60px)", transition: "width .3s" }} />
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = num < step;
              const active = num === step;
              return (
                <div key={num} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      border: `2.5px solid ${done ? BRAND.green : active ? BRAND.orange : "#d1d5db"}`,
                      background: done ? BRAND.green : active ? BRAND.orange : "#fff",
                      color: done || active ? "#fff" : "#9ca3af",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {done ? "✓" : num}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, marginTop: 7, color: done ? BRAND.green : active ? BRAND.orange : "#9ca3af", textAlign: "center" }}>{t(s.lbl)}</span>
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <div style={{ background: "#f9fafb", border: "1.5px solid #e5e7eb", borderRadius: 18, padding: "28px 26px", boxShadow: "0 6px 24px rgba(0,0,0,0.05)" }}>
            {/* STEP 1 */}
            {step === 1 && (
              <div>
                <SectionHead title={t("seva_step1_title")} sub={t("seva_step1_sub")} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                  <Field label={t("seva_lbl_name")}>
                    <input style={FIELD_BASE} value={form.applicantName} onChange={(e) => set("applicantName", e.target.value)} placeholder="उदा. राहुल शांताराम पाटील" />
                  </Field>
                  <Field label={t("seva_lbl_mobile")}>
                    <input style={FIELD_BASE} value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 अंकी मोबाईल" inputMode="numeric" />
                  </Field>
                  <Field label={t("seva_lbl_email")}>
                    <input style={FIELD_BASE} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
                  </Field>
                  <Field label={t("seva_lbl_location")}>
                    <input style={FIELD_BASE} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="उदा. सांगली, तासगाव" />
                  </Field>
                  <Field label={t("seva_lbl_aadhaar")}>
                    <input style={FIELD_BASE} value={form.aadhaar} onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))} placeholder="12 अंकी आधार" inputMode="numeric" />
                  </Field>
                  <Field label={t("seva_lbl_pan")}>
                    <input style={{ ...FIELD_BASE, textTransform: "uppercase" }} value={form.pan} onChange={(e) => set("pan", e.target.value.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" />
                  </Field>
                </div>

                {/* Team members */}
                <div style={{ borderTop: "1.5px solid #e5e7eb", marginTop: 24, paddingTop: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 800, color: "#111827", margin: 0 }}>{t("seva_team_heading")}</h4>
                      <p style={{ fontSize: 12, color: "#6b7280", margin: "3px 0 0" }}>{t("seva_team_sub")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => set("teamMembers", [...form.teamMembers, { name: "", role: "", contact: "" }])}
                      style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      {t("seva_btn_add_member")}
                    </button>
                  </div>
                  {form.teamMembers.map((m, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 8, alignItems: "center" }}>
                      <input style={{ ...FIELD_BASE, padding: "8px 10px", fontSize: 12.5 }} placeholder={t("seva_member_name")} value={m.name} onChange={(e) => { const t2 = [...form.teamMembers]; t2[i] = { ...t2[i], name: e.target.value }; set("teamMembers", t2); }} />
                      <input style={{ ...FIELD_BASE, padding: "8px 10px", fontSize: 12.5 }} placeholder={t("seva_member_role")} value={m.role} onChange={(e) => { const t2 = [...form.teamMembers]; t2[i] = { ...t2[i], role: e.target.value }; set("teamMembers", t2); }} />
                      <input style={{ ...FIELD_BASE, padding: "8px 10px", fontSize: 12.5 }} placeholder={t("seva_member_contact")} value={m.contact} onChange={(e) => { const t2 = [...form.teamMembers]; t2[i] = { ...t2[i], contact: e.target.value }; set("teamMembers", t2); }} />
                      <button type="button" onClick={() => set("teamMembers", form.teamMembers.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#dc2626", fontSize: 16, cursor: "pointer", padding: "4px 8px" }}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div>
                <SectionHead title={t("seva_step2_title")} sub={t("seva_step2_sub")} />
                <Field label={t("seva_lbl_category")}>
                  <select style={{ ...FIELD_BASE, background: "#fff" }} value={form.category} onChange={(e) => set("category", e.target.value)}>
                    <option value="">{t("seva_cat_select")}</option>
                    {CATS.map((c) => (
                      <option key={c.v} value={c.v}>{t(c.k)}</option>
                    ))}
                  </select>
                </Field>
                <div style={{ height: 16 }} />
                <Field label={t("seva_lbl_problem")}>
                  <textarea rows={4} style={{ ...FIELD_BASE, resize: "vertical" }} value={form.problem} onChange={(e) => set("problem", e.target.value)} placeholder={t("seva_ph_problem")} />
                </Field>
                <div style={{ height: 16 }} />
                <Field label={t("seva_lbl_solution")}>
                  <textarea rows={4} style={{ ...FIELD_BASE, resize: "vertical" }} value={form.solution} onChange={(e) => set("solution", e.target.value)} placeholder={t("seva_ph_solution")} />
                </Field>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div>
                <SectionHead title={t("seva_step3_title")} sub={t("seva_step3_sub")} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <Field label={t("seva_lbl_cost")}>
                    <input type="number" min={1000} style={FIELD_BASE} value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="उदा. 250000" />
                  </Field>
                  <Field label={t("seva_lbl_timeline")}>
                    <input type="number" min={1} max={60} style={FIELD_BASE} value={form.timelineMonths} onChange={(e) => set("timelineMonths", e.target.value)} placeholder="उदा. 6" />
                  </Field>
                </div>
                <div style={{ height: 16 }} />
                <Field label={t("seva_lbl_plan")}>
                  <textarea rows={4} style={{ ...FIELD_BASE, resize: "vertical" }} value={form.implementationPlan} onChange={(e) => set("implementationPlan", e.target.value)} placeholder={t("seva_ph_plan")} />
                </Field>
                <div style={{ height: 16 }} />
                <Field label={t("seva_lbl_video")}>
                  <input type="url" style={FIELD_BASE} value={form.videoLink} onChange={(e) => set("videoLink", e.target.value)} placeholder={t("seva_ph_video")} />
                </Field>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div>
                <SectionHead title={t("seva_step4_title")} sub={t("seva_step4_sub")} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
                  {[
                    { key: "ppt", label: `📄 ${t("seva_file_ppt")}`, hint: t("seva_file_ppt_hint"), accept: ".ppt,.pptx,.pdf", max: 15, required: true },
                    { key: "idProof", label: `🪪 ${t("seva_file_id")}`, hint: t("seva_file_id_hint"), accept: ".pdf,.png,.jpg,.jpeg,.webp", max: 5, required: true },
                    { key: "prototype", label: `🖼️ ${t("seva_file_proto")}`, hint: t("seva_file_proto_hint"), accept: ".png,.jpg,.jpeg,.pdf,.zip,.webp", max: 10, required: false },
                    { key: "research", label: `📜 ${t("seva_file_research")}`, hint: t("seva_file_research_hint"), accept: ".pdf", max: 5, required: false },
                  ].map((f) => (
                    <div key={f.key} style={{ border: `1.5px dashed ${files[f.key] ? BRAND.green : "#d1d5db"}`, background: files[f.key] ? BRAND.lightGreen : "#fff", borderRadius: 12, padding: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#1f2937", marginBottom: 8 }}>{f.label}</div>
                      <input
                        type="file"
                        accept={f.accept}
                        onChange={(e) => onFile(f.key, e.target.files?.[0] || null, f.max)}
                        style={{ fontSize: 11.5, width: "100%", color: "#6b7280" }}
                      />
                      <p style={{ fontSize: 10.5, color: "#9ca3af", margin: "6px 0 0" }}>{f.hint}</p>
                      {files[f.key] && (
                        <p style={{ fontSize: 11, color: BRAND.green, fontWeight: 700, margin: "6px 0 0" }}>✓ {files[f.key].name}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 12, padding: 14, marginTop: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <p style={{ fontSize: 12.5, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
                    <b>{lang === "mr" ? "हमीपत्र:" : "Declaration:"}</b> {t("seva_declaration")}
                  </p>
                </div>
              </div>
            )}

            {/* Wizard nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 26, paddingTop: 20, borderTop: "1.5px solid #e5e7eb", gap: 10 }}>
              <button
                type="button"
                onClick={prev}
                style={{
                  padding: "12px 22px",
                  borderRadius: 12,
                  border: "1.5px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  visibility: step === 1 ? "hidden" : "visible",
                }}
              >
                {t("seva_btn_prev")}
              </button>
              {step < 4 ? (
                <button type="button" onClick={next} style={{ padding: "12px 26px", borderRadius: 12, border: "none", background: BRAND.orange, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 14px rgba(230,81,0,0.3)" }}>
                  {t("seva_btn_next")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ padding: "13px 30px", borderRadius: 12, border: "none", background: BRAND.green, color: "#fff", fontWeight: 800, fontSize: 14.5, cursor: submitting ? "default" : "pointer", boxShadow: "0 5px 18px rgba(46,125,50,0.35)", opacity: submitting ? 0.7 : 1, display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  {submitting ? <><Spinner size={18} color="#fff" /> {t("loading")}</> : t("seva_btn_submit")}
                </button>
              )}
            </div>
          </div>

          {/* My submitted apps */}
          <div style={{ marginTop: 44 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: "#111827", margin: 0 }}>{t("seva_my_apps")}</h3>
              <span style={{ background: "#e5e7eb", color: "#374151", fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 16 }}>
                {t("choice_seva_apps")}: {myApps.length}
              </span>
            </div>
            {loadingApps ? (
              <div style={{ textAlign: "center", padding: 26 }}><Spinner size={30} /></div>
            ) : myApps.length === 0 ? (
              <div style={{ background: "#f9fafb", border: "1.5px dashed #d1d5db", borderRadius: 14, padding: 30, textAlign: "center", color: "#9ca3af", fontSize: 13.5, fontWeight: 600 }}>
                📂 {t("seva_ack_note")}
              </div>
            ) : (
              myApps.map((app) => {
                const badge = STATUS_BADGE[app.status] || STATUS_BADGE.submitted;
                return (
                  <div key={app._id || app.uniqueId} style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: `5px solid ${BRAND.green}`, borderRadius: 14, padding: "18px 20px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, background: BRAND.lightGreen, color: BRAND.green, padding: "3px 10px", borderRadius: 8 }}>{app.uniqueId}</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>📅 {new Date(app.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                      <p style={{ fontSize: 12.5, color: "#6b7280", margin: "6px 0 0" }}>
                        <b>{app["idea.category"]?.split(" (")[0] || app.idea?.category || "—"}</b>
                        {app.budget?.cost ? ` · ₹${Number(app.budget.cost).toLocaleString("en-IN")}` : app["budget.cost"] ? ` · ₹${Number(app["budget.cost"]).toLocaleString("en-IN")}` : ""}
                      </p>
                    </div>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: badge.bg, color: badge.color, padding: "6px 15px", borderRadius: 20, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: badge.color }} />
                      {t(badge.label)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: BRAND.dark, color: "#d1d5db", padding: "38px 20px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 26 }}>
          <div>
            <h3 style={{ color: "#fbbf24", fontSize: 16, fontWeight: 800, margin: "0 0 8px" }}>गाव तिथे उद्योजक</h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.65, margin: 0 }}>{t("seva_footer_desc")}</p>
          </div>
          <div>
            <p style={{ fontSize: 12.5, margin: "0 0 6px" }}>{t("seva_footer_email")}</p>
            <p style={{ fontSize: 12.5, margin: 0 }}>{t("seva_footer_helpline")}</p>
          </div>
        </div>
        <div style={{ maxWidth: 1000, margin: "26px auto 0", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 14, textAlign: "center", fontSize: 11.5, color: "#9ca3af" }}>
          {t("seva_copyright")}
        </div>
      </div>
    </div>
  );
}
