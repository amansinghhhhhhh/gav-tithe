import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import C from "../constants/colors";
import { districtMr, talukaMr } from "../constants/maharashtraDataMr";
import { docFileUrl } from "../services/api";

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

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  width: "min(760px, 94vw)",
  maxHeight: "86vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 20px 60px rgba(0,0,0,.35)",
};

const headStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1.5px solid #f3f4f6",
  background: C.light || "#fafafa",
  borderRadius: "16px 16px 0 0",
};

const sectionHeadStyle = {
  fontSize: 13,
  fontWeight: 800,
  color: C.maroon,
  margin: "18px 0 10px",
  paddingBottom: 6,
  borderBottom: "1.5px solid #fde8e8",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "10px 16px",
};

const rowLabel = { fontSize: 11.5, color: "#6b7280", fontWeight: 700, marginBottom: 2 };
const rowValue = { fontSize: 14, color: "#111827", fontWeight: 600, wordBreak: "break-word" };

export default function FormPreview({ form, onClose }) {
  const { t, lang } = useLang();
  const [villageMr, setVillageMr] = useState(null);

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

  const raw = (v) => (v !== undefined && v !== null && String(v).trim() !== "" ? String(v) : "—");
  const lbl = (map, v) => {
    if (!v) return "—";
    return (map[v] && t(map[v])) || v;
  };
  const place = (map, s) => (lang === "mr" && map && map[s] ? map[s] : s);

  const fmtDob = (d) => {
    if (!d) return "—";
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : d;
  };

  const village = addr.village === "__other__" ? addr.villageCustom : addr.village;
  const addressLine = [
    place(districtMr, addr.dist),
    place(talukaMr, addr.taluka),
    place(villageMr, village),
    addr.pincode,
  ]
    .filter((x) => x && String(x).trim())
    .join(", ");

  const Row = ({ label, value }) => (
    <div>
      <div style={rowLabel}>{label}</div>
      <div style={rowValue}>{value}</div>
    </div>
  );

  const Section = ({ title, children }) => (
    <div>
      <div style={sectionHeadStyle}>{title}</div>
      <div style={gridStyle}>{children}</div>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headStyle}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.maroon }}>
            📄 {t("preview_title")}
          </div>
          <button
            onClick={onClose}
            aria-label={t("preview_close")}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: "28px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "6px 20px 22px" }}>
          <Section title={t("s1_title")}>
            <Row label={t("s1_fullname")} value={raw(s1.fullName)} />
            <Row label={t("s1_dob")} value={fmtDob(s1.dob)} />
            <Row label={t("s1_gender")} value={lbl(GENDER, s1.gender)} />
            <Row label={t("s1_mobile")} value={raw(s1.mobile)} />
            <Row label={t("s1_email")} value={raw(s1.email)} />
            <Row label={t("s1_education")} value={lbl(EDU, s1.education)} />
            <Row label={t("s1_referredby")} value={raw(s1.referredBy)} />
            <Row label={t("s1_referrer_mobile")} value={raw(s1.referrerMobile)} />
            <div style={{ gridColumn: "1 / -1" }}>
              <Row label={t("s1_address")} value={addressLine || "—"} />
            </div>
          </Section>

          <Section title={t("s2_title")}>
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
          </Section>

          <Section title={t("s3_title")}>
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
          </Section>

          <Section title={t("s4_title")}>
            <Row label={t("s4_aadhaar")} value={raw(s4.aadhaar)} />
            <Row label={t("s4_pan")} value={raw(s4.pan)} />
            <Row label={t("s4_udyam")} value={raw(s4.udyam)} />
            <Row label={t("s4_bank_name_ph")} value={raw(s4.bankName)} />
            <Row label={t("s4_acc_ph")} value={raw(s4.accountNo)} />
          </Section>

          <div style={sectionHeadStyle}>{t("preview_docs")}</div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {DOC_LIST.map(([key, labelKey]) => {
              const fileId = docs[key];
              return (
                <div key={key} style={{ width: 138 }}>
                  <div style={rowLabel}>{t(labelKey)}</div>
                  {fileId ? (
                    <a href={docFileUrl(fileId)} target="_blank" rel="noreferrer">
                      <img
                        src={docFileUrl(fileId)}
                        alt={t(labelKey)}
                        onError={(e) => {
                          e.currentTarget.style.visibility = "hidden";
                        }}
                        style={{
                          width: 138,
                          height: 88,
                          objectFit: "cover",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 8,
                          background: "#f3f4f6",
                          display: "block",
                        }}
                      />
                    </a>
                  ) : (
                    <div
                      style={{
                        width: 138,
                        height: 88,
                        border: "1.5px dashed #d1d5db",
                        borderRadius: 8,
                        background: "#f9fafb",
                        color: "#9ca3af",
                        fontSize: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
