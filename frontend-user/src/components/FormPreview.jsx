import { useEffect, useRef, useState } from "react";
import { useLang } from "../context/LangContext";
import C from "../constants/colors";
import { districtMr, talukaMr } from "../constants/maharashtraDataMr";
import { override } from "../constants/placeRename";
import { docFileUrl } from "../services/api";
import guicon from "../assets/guicon.svg";

const GENDER = { purush: "s1_male", mahila: "s1_female", itar: "s1_other" };
const EDU = {
  below10: "s1_edu_1",
  "10th": "s1_edu_2",
  "12th": "s1_edu_3",
  diploma: "s1_edu_4",
  graduate: "s1_edu_5",
  postgraduate: "s1_edu_6",
};
const BTYPE = {
  manufacturing: "s2_bt_mfg",
  services: "s2_bt_svc",
  trading: "s2_bt_trd",
  agriculture: "s2_bt_agr",
  technology: "s2_bt_tec",
  other: "s2_bt_oth",
};
const SECTOR = {
  agri: "s2_sc_agri",
  food: "s2_sc_food",
  tech: "s2_sc_tech",
  textile: "s2_sc_text",
  health: "s2_sc_hlth",
  education: "s2_sc_edu",
  construction: "s2_sc_cons",
  other: "s2_sc_oth",
};
const BSTATUS = { ideation: "s2_st_idea", new: "s2_st_new", established: "s2_st_est" };
const YESNO = { hoy: "s3_yes", nahi: "s3_no" };
const LTYPE = {
  personal: "s3_lt_per",
  business: "s3_lt_biz",
  home: "s3_lt_home",
  vehicle: "s3_lt_veh",
  agriculture: "s3_lt_agr",
  other: "s3_lt_oth",
};
const REPAY = { regular: "s3_rep_reg", irregular: "s3_rep_irr", settled: "s3_rep_set", na: "s3_rep_na" };
const DOC_LIST = [
  ["aadhaarFront", "s4_doc_aadh_front"],
  ["aadhaarBack", "s4_doc_aadh_back"],
  ["pan", "s4_doc_pan"],
  ["udyam", "s4_doc_udyam"],
  ["passport", "s4_doc_pass"],
];

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  marginBottom: 5,
  display: "block",
  textAlign: "left",
};

const valueBoxStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  border: "1.5px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  color: "#222",
  background: "#f5f5f5",
  lineHeight: 1.45,
  wordBreak: "break-word",
  textAlign: "left",
};

const sectionCard = {
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 12,
  overflow: "hidden",
  marginBottom: 18,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const sectionBar = {
  background: C.light,
  padding: "13px 18px",
  fontSize: 15,
  fontWeight: 700,
  color: "#111",
  textAlign: "left",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
  gap: 16,
  textAlign: "left",
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });

export default function FormPreview({ form, onClose }) {
  const { t, lang } = useLang();
  const [villageMr, setVillageMr] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState(false);
  const cardRef = useRef(null);
  const bodyRef = useRef(null);

  useEffect(() => {
    if (lang !== "mr") return;
    let alive = true;
    import("../constants/maharashtraVillagesMr")
      .then((m) => {
        if (alive) setVillageMr(m.villageMr);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lang]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!form) return null;

  const s1 = form.section1 || {};
  const s2 = form.section2 || {};
  const s3 = form.section3 || {};
  const s4 = form.section4 || {};
  const addr = s1.address || {};
  const docs = s4.docs || {};

  const raw = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? String(v).trim() : "—");
  const lbl = (map, v) => {
    if (!v) return "—";
    return (map[v] && t(map[v])) || v;
  };
  const place = (kind, map, s) =>
    override(kind, lang, s) || (lang === "mr" && map && map[s] ? map[s] : s);

  const fmtDob = (d) => {
    if (!d) return "—";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
  };

  const village = addr.village === "__other__" ? addr.villageCustom : addr.village;
  const addressLine = [
    place("district", districtMr, addr.dist),
    place("taluka", talukaMr, addr.taluka),
    place("village", villageMr, village),
    addr.pincode,
  ]
    .filter((x) => x && String(x).trim())
    .join(", ");

  const Row = ({ label, value, wide }) => (
    <div style={wide ? { gridColumn: "1 / -1" } : undefined}>
      <span style={labelStyle}>{label}</span>
      <div style={valueBoxStyle}>
        {value === "—" ? <span style={{ color: "#9ca3af", fontWeight: 500 }}>—</span> : value}
      </div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={sectionCard}>
      <div style={sectionBar}>{title}</div>
      <div style={{ padding: "18px" }}>{children}</div>
    </div>
  );

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    setDlError(false);
    const card = cardRef.current;
    const body = bodyRef.current;
    if (!card || !body) {
      setDownloading(false);
      return;
    }
    const cardPrev = card.getAttribute("style");
    const bodyPrev = body.getAttribute("style");
    let canvas = null;
    try {
      // Poori form capture ke liye temporarily un-clip
      card.style.maxHeight = "none";
      card.style.width = "720px";
      card.style.maxWidth = "720px";
      body.style.overflow = "visible";
      await new Promise((r) => setTimeout(r, 80));
      const { default: html2canvas } = await import("html2canvas");
      canvas = await html2canvas(card, {
        scale: 2,
        backgroundColor: "#fff",
        useCORS: true,
        logging: false,
      });
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      if (cardPrev !== null) card.setAttribute("style", cardPrev);
      if (bodyPrev !== null) body.setAttribute("style", bodyPrev);
    }

    if (!canvas) {
      setDlError(true);
      setTimeout(() => setDlError(false), 4000);
      setDownloading(false);
      return;
    }

    try {
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

        // Watermark — ek bada centered guicon logo (10% opacity, -30°)
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
      }

      const name = form.uniqueId ? `GTU_${form.uniqueId}.pdf` : "form_preview.pdf";
      pdf.save(name);
    } catch (err) {
      console.error("PDF download failed:", err);
      setDlError(true);
      setTimeout(() => setDlError(false), 4000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <style>{`
        .pv-scroll::-webkit-scrollbar { width: 6px; }
        .pv-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .pv-scroll::-webkit-scrollbar-thumb { background: #F97316; border-radius: 10px; }
        .pv-scroll::-webkit-scrollbar-thumb:hover { background: #ea580c; }
        .pv-thumb { transition: border-color .2s, transform .2s; }
        .pv-thumb:hover { border-color: #F97316 !important; transform: translateY(-2px); }
        .pv-close { transition: background .2s; }
        .pv-close:hover { background: rgba(255,255,255,0.45) !important; }
      `}</style>
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 720,
          maxHeight: "86vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header — FaqModal orange gradient */}
        <div
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #fb923c 60%, #fbbf24 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 20px",
            flexShrink: 0,
            textAlign: "left",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
              📄 {t("preview_title")}
            </h3>
            {form.uniqueId && (
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.92)",
                  fontFamily: "monospace",
                  letterSpacing: 1,
                }}
              >
                {form.uniqueId}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="pv-close"
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: "none",
                background: "rgba(255,255,255,0.25)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12.5,
                fontFamily: "inherit",
                cursor: downloading ? "wait" : "pointer",
                whiteSpace: "nowrap",
                opacity: downloading ? 0.85 : 1,
              }}
            >
              {downloading ? `⏳ ${t("preview_downloading")}` : `⬇ ${t("preview_download")}`}
            </button>
            <button
              onClick={onClose}
              aria-label={t("preview_close")}
              className="pv-close"
              style={{
                width: 30,
                height: 30,
                flexShrink: 0,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.25)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body — sab left aligned */}
        <div
          ref={bodyRef}
          className="pv-scroll"
          style={{ overflowY: "auto", padding: "18px 20px 24px", textAlign: "left" }}
        >
          {dlError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1.5px solid #fca5a5",
                color: "#b91c1c",
                fontSize: 13,
                fontWeight: 600,
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 14,
                textAlign: "left",
              }}
            >
              ⚠ {t("preview_download_err")}
            </div>
          )}
          <Section title={t("s1_title")}>
            <div style={gridStyle}>
              <Row label={t("s1_fullname")} value={raw(s1.fullName)} />
              <Row label={t("s1_dob")} value={fmtDob(s1.dob)} />
              <Row label={t("s1_gender")} value={lbl(GENDER, s1.gender)} />
              <Row label={t("s1_mobile")} value={raw(s1.mobile)} />
              <Row label={t("s1_email")} value={raw(s1.email)} />
              <Row label={t("s1_education")} value={lbl(EDU, s1.education)} />
              <Row label={t("s1_referredby")} value={raw(s1.referredBy)} />
              <Row label={t("s1_referrer_mobile")} value={raw(s1.referrerMobile)} />
              <Row label={t("s1_address")} value={addressLine || "—"} wide />
            </div>
          </Section>

          <Section title={t("s2_title")}>
            <div style={gridStyle}>
              <Row label={t("s2_biz_name")} value={raw(s2.businessName)} />
              <Row label={t("s2_biz_type")} value={lbl(BTYPE, s2.businessType)} />
              <Row
                label={t("s2_sector")}
                value={
                  s2.sector === "other" && s2.sectorOther
                    ? `${lbl(SECTOR, s2.sector)} — ${s2.sectorOther}`
                    : lbl(SECTOR, s2.sector)
                }
              />
              <Row label={t("s2_status")} value={lbl(BSTATUS, s2.businessStatus)} />
              <Row label={t("s2_employ")} value={raw(s2.employment)} />
              <Row label={t("s2_invest")} value={s2.investment ? `₹ ${s2.investment}` : "—"} />
            </div>
          </Section>

          <Section title={t("s3_title")}>
            <div style={gridStyle}>
              <Row label={t("s3_had_loan")} value={lbl(YESNO, s3.hadLoan)} />
              <Row
                label={t("s3_loan_type")}
                value={
                  s3.loanType === "other" && s3.loanTypeOther
                    ? `${lbl(LTYPE, s3.loanType)} — ${s3.loanTypeOther}`
                    : lbl(LTYPE, s3.loanType)
                }
              />
              <Row label={t("s3_repay")} value={lbl(REPAY, s3.repaymentStatus)} />
              <Row label={t("s3_cibil")} value={raw(s3.cibilScore)} />
              <Row label={t("s3_difficulty")} value={raw(s3.pastDifficulty)} />
            </div>
          </Section>

          <Section title={t("s4_title")}>
            <div style={gridStyle}>
              <Row label={t("s4_aadhaar")} value={raw(s4.aadhaar)} />
              <Row label={t("s4_pan")} value={raw(s4.pan)} />
              <Row label={t("s4_udyam")} value={raw(s4.udyam)} />
              <Row label={t("s4_bank_name_ph")} value={raw(s4.bankName)} />
              <Row label={t("s4_acc_ph")} value={raw(s4.accountNo)} />
            </div>
          </Section>

          {/* Documents */}
          <div style={sectionCard}>
            <div style={sectionBar}>{t("preview_docs")}</div>
            <div
              style={{
                padding: 18,
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                textAlign: "left",
              }}
            >
              {DOC_LIST.map(([key, labelKey]) => {
                const fileId = docs[key];
                return (
                  <div key={key} style={{ width: 150 }}>
                    {fileId ? (
                      <a href={docFileUrl(fileId)} target="_blank" rel="noreferrer">
                        <img
                          src={docFileUrl(fileId)}
                          alt={t(labelKey)}
                          className="pv-thumb"
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                          style={{
                            width: 150,
                            height: 96,
                            objectFit: "cover",
                            border: "2px solid #e5e7eb",
                            borderRadius: 10,
                            background: "#f3f4f6",
                            display: "block",
                          }}
                        />
                      </a>
                    ) : (
                      <div
                        className="pv-thumb"
                        style={{
                          width: 150,
                          height: 96,
                          border: "2px dashed #d1d5db",
                          borderRadius: 10,
                          background: "#f9fafb",
                          color: "#9ca3af",
                          fontSize: 22,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        —
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#6b7280",
                        marginTop: 7,
                        textAlign: "left",
                      }}
                    >
                      {t(labelKey)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
