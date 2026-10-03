import { useEffect, useRef, useState } from "react";
import C from "../constants/colors";
import { useLang } from "../context/LangContext";
import DocUploadBox from "./shared/DocUploadBox";
import { Spinner } from "./shared/Spinner";
import { getMyForm, uploadDoc, removeDoc } from "../services/api";
import guicon from "../assets/guicon.svg";

const STEPS = ["dpr_step_sizing", "dpr_step_ops", "dpr_step_subsidy", "dpr_step_kyc", "dpr_step_fin"];

const SCHEMES = [
  { id: "pmegp", key: "dpr_scheme_pmegp", pct: 35 },
  { id: "pmfme", key: "dpr_scheme_pmfme", pct: 35 },
  { id: "cmegp", key: "dpr_scheme_cmegp", pct: 25 },
  { id: "none", key: "dpr_scheme_none", pct: 0 },
];

// uploadable = builder se direct upload (form-managed OCR docs yahan read-only hain)
const KYC_DOCS = [
  { id: "aadhaar", key: "dpr_doc_aadhaar", required: true, uploadable: false, has: (d) => !!(d.aadhaarFront && d.aadhaarBack) },
  { id: "pan", key: "dpr_doc_pan", required: true, uploadable: false, has: (d) => !!d.pan },
  { id: "bankPassbook", key: "dpr_doc_passbook", required: true, uploadable: true, has: (d) => !!d.bankPassbook },
  { id: "passport", key: "dpr_doc_photo", required: true, uploadable: false, has: (d) => !!d.passport },
  { id: "educationCert", key: "dpr_doc_edu", required: false, uploadable: true, has: (d) => !!d.educationCert },
  { id: "casteCert", key: "dpr_doc_caste", required: false, uploadable: true, has: (d) => !!d.casteCert },
  { id: "landDoc", key: "dpr_doc_land", required: false, uploadable: true, has: (d) => !!d.landDoc },
  { id: "electricityBill", key: "dpr_doc_elec", required: false, uploadable: true, has: (d) => !!d.electricityBill },
];

const fmtINR = (n) => {
  const v = Number(n) || 0;
  const a = Math.abs(v);
  if (a >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  if (a >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${Math.round(v)}`;
};

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "dpr";

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

export default function DPRBuilder({ entry, onClose, onGoForm }) {
  const { t, lang } = useLang();
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [cost, setCost] = useState("");
  const [own, setOwn] = useState("");
  const [rawCost, setRawCost] = useState("");
  const [sales, setSales] = useState("");
  const [scheme, setScheme] = useState("pmegp");
  const [serverDocs, setServerDocs] = useState(null); // null = loading
  const [busyKey, setBusyKey] = useState(null);
  const [upErr, setUpErr] = useState({});
  const [showMore, setShowMore] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const reportRef = useRef(null);

  // ── Form KYC docs load (auto-check ke liye) ──
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getMyForm();
        if (alive) setServerDocs((res.success && res.form && res.form.section4?.docs) || {});
      } catch {
        if (alive) setServerDocs({});
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const docs = serverDocs || {};
  const costN = parseFloat(cost) || 0;
  const ownN = parseFloat(own) || 0;
  const rawN = rawCost === "" ? NaN : parseFloat(rawCost);
  const salesN = sales === "" ? NaN : parseFloat(sales);
  const ownPct = costN > 0 ? Math.round((ownN / costN) * 100) : 0;
  const schemeObj = SCHEMES.find((s) => s.id === scheme) || SCHEMES[0];
  const subsidy = Math.max(0, Math.round((costN * schemeObj.pct) / 100));
  const loan = Math.max(0, costN - ownN - subsidy);
  const monthlyProfit = (salesN || 0) - (rawN || 0);
  const roi = costN > 0 ? Math.round((monthlyProfit * 12 * 100) / costN) : 0;
  const uploadedCount = KYC_DOCS.filter((d) => d.has(docs)).length;
  const requiredOK = serverDocs !== null && KYC_DOCS.filter((d) => d.required).every((d) => d.has(docs));

  const stepValid = [
    costN > 0 && ownN >= costN * 0.1 && ownN <= costN,
    !isNaN(rawN) && rawN >= 0 && !isNaN(salesN) && salesN > 0,
    true,
    requiredOK,
    true,
  ][step];

  const goNext = () => {
    if (!stepValid) return;
    const n = Math.min(4, step + 1);
    setStep(n);
    setMaxVisited((m) => Math.max(m, n));
  };
  const goBack = () => setStep(Math.max(0, step - 1));
  const jumpTo = (i) => {
    if (i <= maxVisited) setStep(i);
  };

  const handleUpload = async (docType, file) => {
    setBusyKey(docType);
    setUpErr((p) => ({ ...p, [docType]: null }));
    try {
      const res = await uploadDoc(docType, file);
      if (res.success) setServerDocs((prev) => ({ ...(prev || {}), [docType]: res.fileId }));
      else setUpErr((p) => ({ ...p, [docType]: res.message || "Upload failed" }));
    } catch (e) {
      setUpErr((p) => ({ ...p, [docType]: e.message || "Upload failed" }));
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemove = async (docType) => {
    if (!window.confirm(t("s4_remove_confirm"))) return;
    setBusyKey(docType);
    try {
      const res = await removeDoc(docType);
      if (res.success) setServerDocs((prev) => ({ ...(prev || {}), [docType]: null }));
    } catch {
      /* ignore */
    } finally {
      setBusyKey(null);
    }
  };

  // ── Generate DPR PDF (FormPreview pattern — language-safe capture) ──
  const generatePdf = async () => {
    if (pdfBusy || !reportRef.current) return;
    setPdfBusy(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#fff",
        useCORS: true,
        logging: false,
      });
      const { jsPDF } = await import("jspdf");
      const wm = await loadImage(guicon);
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

      const MARGIN = 6;
      const PAGE_W = 210 - MARGIN * 2;
      const PAGE_H = 297 - MARGIN * 2;
      const mmPerPx = PAGE_W / canvas.width;
      const totalPages = Math.max(1, Math.ceil((canvas.height * mmPerPx) / PAGE_H));

      for (let p = 0; p < totalPages; p++) {
        const srcY = Math.round((p * PAGE_H) / mmPerPx);
        const srcH = Math.min(canvas.height - srcY, Math.round(PAGE_H / mmPerPx));
        if (srcH <= 0) break;

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = srcH;
        const ctx = pageCanvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, srcH);
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        // Watermark — centered guicon logo (10% opacity, -30°)
        const wmPx = 110 / mmPerPx;
        const wmH = wmPx * (wm.height / wm.width);
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.translate(pageCanvas.width / 2, srcH / 2);
        ctx.rotate((-30 * Math.PI) / 180);
        ctx.drawImage(wm, -wmPx / 2, -wmH / 2, wmPx, wmH);
        ctx.restore();

        const data = pageCanvas.toDataURL("image/jpeg", 0.92);
        if (p > 0) pdf.addPage();
        pdf.addImage(data, "JPEG", MARGIN, MARGIN, PAGE_W, srcH * mmPerPx);

        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Page ${p + 1} / ${totalPages}`, 105, 293.5, { align: "center" });
      }

      pdf.save(`dpr_${slug(entry.variantName)}_${entry.variantId}.pdf`);
    } catch (err) {
      console.error("DPR PDF failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setPdfBusy(false);
    }
  };

  const labelStyle = {
    display: "block",
    fontSize: 13.5,
    fontWeight: 700,
    color: C.navy,
    textAlign: "left",
    marginBottom: 7,
  };
  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: `1.5px solid #cbd5e1`,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    color: "#0f172a",
    outline: "none",
    background: "#fff",
  };
  const hintStyle = { fontSize: 11.5, color: C.textopa, marginTop: 6, textAlign: "left", fontWeight: 600 };
  const errStyle = { fontSize: 11.5, color: "#dc2626", marginTop: 6, textAlign: "left", fontWeight: 700 };

  const finCards = [
    { label: t("dpr_total_cost"), value: fmtINR(costN), color: C.navy },
    { label: t("dpr_own"), value: `${fmtINR(ownN)} (${ownPct}%)`, color: "#2563eb" },
    { label: t("dpr_subsidy"), value: fmtINR(subsidy), color: "#16a34a" },
    { label: t("dpr_bank_loan_card"), value: fmtINR(loan), color: "#7c3aed" },
    { label: t("dpr_monthly_profit"), value: fmtINR(monthlyProfit), color: monthlyProfit > 0 ? "#16a34a" : monthlyProfit < 0 ? "#dc2626" : C.navy },
    { label: t("dpr_roi"), value: `${roi}%`, color: roi > 0 ? "#16a34a" : roi < 0 ? "#dc2626" : C.navy },
  ];

  const warnings = [];
  if (!isNaN(salesN) && !isNaN(rawN) && salesN <= rawN) warnings.push(t("dpr_warn_sales"));
  if (roi <= 0) warnings.push(t("dpr_warn_roi"));

  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,32,64,.55)",
        backdropFilter: "blur(3px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes dprIn { from { opacity: 0; transform: translateY(18px) scale(.985); } to { opacity: 1; transform: none; } }
        @keyframes dprFade { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: none; } }
        .dpr-panel { animation: dprIn .28s ease; }
        .dpr-step { animation: dprFade .22s ease; }
        .dpr-scroll::-webkit-scrollbar { width: 6px; }
        .dpr-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .dpr-scroll::-webkit-scrollbar-thumb { background: ${C.orange}; border-radius: 10px; }
        .dpr-tab { transition: all .15s ease; cursor: pointer; }
        .dpr-tab:hover { opacity: .85; }
        .dpr-input:focus { border-color: ${C.orange} !important; box-shadow: 0 0 0 3px rgba(249,115,22,.15); }
      `}</style>

      <div
        className="dpr-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #eef2f7", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.navy }}>
                🏗️ {t("dpr_title")}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textopa, marginTop: 4 }}>
                {entry.variantName} (Variant {entry.variantId}) — {entry.category || entry.sector}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#f1f5f9",
                border: "none",
                fontSize: 16,
                color: C.navy,
                cursor: "pointer",
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          {/* Step tabs */}
          <div style={{ display: "flex", gap: 6, marginTop: 14, overflowX: "auto", paddingBottom: 2 }}>
            {STEPS.map((k, i) => {
              const active = i === step;
              const done = i < step || (i < maxVisited && i !== step);
              return (
                <div
                  key={k}
                  className="dpr-tab"
                  onClick={() => jumpTo(i)}
                  style={{
                    flex: 1,
                    minWidth: "fit-content",
                    padding: "7px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    textAlign: "center",
                    background: active ? C.navy : done ? "#dcfce7" : "#f1f5f9",
                    color: active ? "#fff" : done ? "#166534" : "#94a3b8",
                    border: active ? "none" : `1px solid ${done ? "#86efac" : "#e2e8f0"}`,
                    cursor: i <= maxVisited ? "pointer" : "default",
                  }}
                >
                  {done && !active ? "✓ " : `${i + 1}. `}{t(k)}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="dpr-scroll" style={{ overflowY: "auto", flex: 1, minHeight: 0, padding: "20px 32px", background: "#fff" }}>
          {/* Step 1 — Project Sizing */}
          {step === 0 && (
            <div className="dpr-step" style={{ background: "transparent", padding: 0 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>{t("dpr_cost_label")}</label>
                <input
                  className="dpr-input"
                  style={inputStyle}
                  value={cost}
                  onChange={(e) => setCost(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder={t("dpr_cost_ph")}
                  inputMode="decimal"
                />
                <div style={hintStyle}>
                  {t("dpr_range")}
                  <span style={{ color: C.navy, fontWeight: 800 }}>{entry.investmentRange}</span>
                </div>
                {cost !== "" && !(costN > 0) && <div style={errStyle}>{t("dpr_cost_invalid")}</div>}
              </div>

              <div style={{ marginBottom: 6 }}>
                <label style={labelStyle}>{t("dpr_own_label")}</label>
                <input
                  className="dpr-input"
                  style={inputStyle}
                  value={own}
                  onChange={(e) => setOwn(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder={t("dpr_own_ph")}
                  inputMode="decimal"
                />
                <div style={{ ...hintStyle, fontSize: 13, color: ownN > 0 && ownPct < 10 ? "#dc2626" : ownPct >= 10 ? "#16a34a" : C.textopa }}>
                  {ownPct}%
                </div>
                {costN > 0 && own !== "" && ownN < costN * 0.1 && <div style={errStyle}>{t("dpr_own_min")}</div>}
                {costN > 0 && ownN > costN && <div style={errStyle}>{t("dpr_own_over")}</div>}
              </div>
            </div>
          )}

          {/* Step 2 — Operations */}
          {step === 1 && (
            <div className="dpr-step" style={{ background: "transparent", padding: 0 }}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>{t("dpr_raw_label")}</label>
                <input
                  className="dpr-input"
                  style={inputStyle}
                  value={rawCost}
                  onChange={(e) => setRawCost(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder={t("dpr_raw_ph")}
                  inputMode="decimal"
                />
              </div>
              <div>
                <label style={labelStyle}>{t("dpr_sales_label")}</label>
                <input
                  className="dpr-input"
                  style={inputStyle}
                  value={sales}
                  onChange={(e) => setSales(e.target.value.replace(/[^\d.]/g, ""))}
                  placeholder={t("dpr_sales_ph")}
                  inputMode="decimal"
                />
              </div>
              {rawCost !== "" && isNaN(rawN) && <div style={errStyle}>{t("dpr_ops_invalid")}</div>}
            </div>
          )}

          {/* Step 3 — Subsidy & Loan */}
          {step === 2 && (
            <div className="dpr-step" style={{ background: "transparent", padding: 0 }}>
              <label style={labelStyle}>{t("dpr_scheme_label")}</label>
              <select
                className="dpr-input"
                style={{ ...inputStyle, cursor: "pointer", appearance: "auto" }}
                value={scheme}
                onChange={(e) => setScheme(e.target.value)}
              >
                {SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.key)}
                  </option>
                ))}
              </select>

              <div
                style={{
                  marginTop: 18,
                  background: `${C.navy}0a`,
                  border: `1px solid ${C.navy}22`,
                  borderRadius: 12,
                  padding: "16px 18px",
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.navy, textAlign: "left", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {t("dpr_breakdown")}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.textopa }}>{t("dpr_subsidy_amount")}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#16a34a" }}>{fmtINR(subsidy)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.textopa }}>{t("dpr_bank_loan")}</span>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#7c3aed" }}>{fmtINR(loan)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — KYC Documents */}
          {step === 3 && (
            <div className="dpr-step" style={{ background: "transparent", padding: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontSize: 15.5, fontWeight: 800, color: C.navy, textAlign: "left" }}>
                  📄 {t("dpr_kyc_title")}
                </div>
                <div
                  style={{
                    background: uploadedCount === 8 ? "#dcfce7" : `${C.orange}15`,
                    color: uploadedCount === 8 ? "#166534" : "#c2410c",
                    fontWeight: 800,
                    fontSize: 14,
                    padding: "5px 14px",
                    borderRadius: 999,
                  }}
                >
                  {uploadedCount}/8
                </div>
              </div>
              <div style={hintStyle}>{t("dpr_kyc_hint")}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginTop: 16 }}>
                {KYC_DOCS.map((doc) => {
                  const label = t(doc.key) + (doc.required ? " *" : "");
                  const uploaded = doc.has(docs);
                  if (!doc.uploadable) {
                    // Form-managed (read-only) docs
                    if (uploaded) {
                      return (
                        <div
                          key={doc.id}
                          style={{
                            border: "2px solid #16a34a",
                            borderRadius: 10,
                            padding: "18px 10px",
                            background: "#f0fff4",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 6,
                            textAlign: "center",
                          }}
                        >
                          <span style={{ fontSize: 22, color: "#16a34a", fontWeight: 800 }}>✓</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>{label}</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#16a34a" }}>{t("dpr_uploaded")}</span>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={doc.id}
                        onClick={() => onGoForm && onGoForm()}
                        style={{
                          border: "2px dashed #f59e0b",
                          borderRadius: 10,
                          padding: "14px 10px",
                          background: "#fffbeb",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          textAlign: "center",
                          cursor: onGoForm ? "pointer" : "default",
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{ fontSize: 20, color: "#d97706" }}>⚠</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>{label}</span>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: "#d97706" }}>{t("dpr_not_in_form")}</span>
                      </button>
                    );
                  }
                  return (
                    <DocUploadBox
                      key={doc.id}
                      label={label}
                      uploaded={uploaded}
                      loading={busyKey === doc.id}
                      onUpload={(file) => handleUpload(doc.id, file)}
                      onRemove={uploaded ? () => handleRemove(doc.id) : undefined}
                      error={upErr[doc.id] || null}
                    />
                  );
                })}
              </div>

              {!requiredOK && serverDocs !== null && (
                <div style={{ ...errStyle, marginTop: 14, textAlign: "center" }}>{t("dpr_kyc_req_pending")}</div>
              )}
              {serverDocs === null && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginTop: 14, color: C.textopa, fontSize: 12, fontWeight: 600 }}>
                  <Spinner size={16} /> Loading documents...
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Financial Preview */}
          {step === 4 && (
            <div className="dpr-step" style={{ background: "transparent", padding: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: C.navy, textAlign: "left", marginBottom: 14 }}>
                📊 {t("dpr_fin_title")}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
                {finCards.map((c) => (
                  <div
                    key={c.label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "14px 12px",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textopa, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      {c.label}
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: c.color, marginTop: 5 }}>
                      {c.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginTop: 16, textAlign: "left" }}>
                {t("dpr_docs_uploaded")}
                <span style={{ color: uploadedCount === 8 ? "#16a34a" : C.orange }}>{uploadedCount}/8</span>
              </div>

              {warnings.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: 10,
                    padding: "12px 16px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", marginBottom: 6 }}>
                    {t("dpr_fin_incomplete")}
                  </div>
                  {warnings.map((w) => (
                    <div key={w} style={{ fontSize: 12.5, fontWeight: 600, color: "#9a3412", marginBottom: 3 }}>
                      • {w}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowMore((v) => !v)}
                style={{
                  marginTop: 16,
                  background: "none",
                  border: "none",
                  color: C.orange,
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: 0,
                  textAlign: "left",
                }}
              >
                {t("dpr_more")} {showMore ? "▲" : "▼"}
              </button>
              {showMore && (
                <div style={{ marginTop: 10, borderTop: "1px dashed #e2e8f0", paddingTop: 12 }}>
                  {(entry.description || "")
                    .split(/\n+/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((p, i) => (
                      <p key={i} style={{ margin: "0 0 10px", fontSize: 12.5, color: "#4b5563", lineHeight: 1.7, textAlign: "left" }}>
                        {p}
                      </p>
                    ))}
                  {!entry.description && (
                    <p style={{ margin: 0, fontSize: 12.5, color: "#9ca3af", fontStyle: "italic", textAlign: "left" }}>
                      {lang === "mr"
                        ? "या प्रोजेक्टचा सविस्तर तपशील लवकरच उपलब्ध होईल."
                        : "Detailed project information will be available soon."}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            padding: "14px 22px",
            borderTop: "1px solid #eef2f7",
            background: "#fff",
          }}
        >
          <div>
            {step === 0 ? (
              <button
                onClick={onClose}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: "#f1f5f9",
                  color: C.navy,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("dpr_cancel")}
              </button>
            ) : (
              <button
                onClick={goBack}
                style={{
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: "#f1f5f9",
                  color: C.navy,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ← {t("dpr_back")}
              </button>
            )}
          </div>

          {step < 4 ? (
            <button
              onClick={goNext}
              disabled={!stepValid}
                           style={{
                padding: "10px 26px",
                borderRadius: 999,
                border: "none",
                background: stepValid ? C.orange : "#cbd5e1",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: stepValid ? "pointer" : "default",
                boxShadow: stepValid ? "0 4px 12px rgba(249,115,22,.35)" : "none",
              }}
            >
              {t("dpr_next")} →
            </button>
          ) : (
            <button
              onClick={generatePdf}
              disabled={pdfBusy}
              style={{
                padding: "10px 26px",
                borderRadius: 999,
                border: "none",
                background: pdfBusy ? "#94a3b8" : "#16a34a",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: pdfBusy ? "default" : "pointer",
                boxShadow: pdfBusy ? "none" : "0 4px 12px rgba(22,163,74,.35)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {pdfBusy && <Spinner size={15} />}
              {pdfBusy ? t("dpr_generating") : `📄 ${t("dpr_generate")}`}
            </button>
          )}
        </div>
      </div>

      {/* ── Hidden report layout (PDF capture — browser language rendering) ── */}
      <div
        ref={reportRef}
        style={{
          position: "absolute",
          left: -99999,
          top: 0,
          width: 760,
          boxSizing: "border-box",
          padding: 30,
          background: "#fff",
          color: "#334155",
          fontFamily: 'system-ui, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, borderBottom: "2px solid #142952", paddingBottom: 14 }}>
          <img src={guicon} alt="" style={{ height: 46 }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, lineHeight: 1.2 }}>{t("dpr_pdf_title")}</div>
            <div style={{ fontSize: 13.5, color: "#64748b", marginTop: 3 }}>
              {entry.variantName} (Variant {entry.variantId}) — {entry.category || entry.sector}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
              {t("dpr_pdf_generated")}: {dateStr}
            </div>
          </div>
        </div>

        {[
          {
            title: t("dpr_step_sizing"),
            rows: [
              [t("dpr_cost_label"), fmtINR(costN)],
              [t("dpr_own_label"), `${fmtINR(ownN)} (${ownPct}%)`],
            ],
          },
          {
            title: t("dpr_step_ops"),
            rows: [
              [t("dpr_raw_label"), fmtINR(rawN || 0)],
              [t("dpr_sales_label"), fmtINR(salesN || 0)],
            ],
          },
          {
            title: t("dpr_step_subsidy"),
            rows: [
              [t("dpr_scheme_label"), t(schemeObj.key)],
              [t("dpr_subsidy_amount"), fmtINR(subsidy)],
              [t("dpr_bank_loan"), fmtINR(loan)],
            ],
          },
        ].map((sec) => (
          <div key={sec.title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7, textAlign: "left" }}>
              {sec.title}
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>
                {sec.rows.map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 10px", textAlign: "left", color: "#64748b" }}>{k}</td>
                    <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {/* KYC status */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7, textAlign: "left" }}>
            {t("dpr_pdf_kyc")} ({uploadedCount}/8)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 18px" }}>
            {KYC_DOCS.map((d) => {
              const ok = d.has(docs);
              return (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 8px", background: ok ? "#f0fdf4" : "#fef2f2", borderRadius: 6 }}>
                  <span style={{ color: "#475569", fontWeight: 600 }}>{t(d.key)}</span>
                  <span style={{ fontWeight: 800, color: ok ? "#16a34a" : "#dc2626" }}>{ok ? "✓" : "✗"}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial dashboard */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7, textAlign: "left" }}>
            {t("dpr_fin_title")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {finCards.map((c) => (
              <div key={c.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", textAlign: "left" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{c.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: c.color, marginTop: 3 }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {(entry.description || "")
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p, i) => (
            <p key={i} style={{ margin: "0 0 9px", fontSize: 11.5, color: "#64748b", lineHeight: 1.7, textAlign: "left" }}>
              {p}
            </p>
          ))}
      </div>
    </div>
  );
}
