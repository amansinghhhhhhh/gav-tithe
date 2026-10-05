import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useLang } from "./context/LangContext";
import { getMyForm, getEditRequest } from "./services/api";
import { Spinner } from "./components/shared/Spinner";
import C from "./constants/colors";

const KYC_DOCS = [
  { id: "aadhaarFront", key: "s4_doc_aadh_front" },
  { id: "aadhaarBack", key: "s4_doc_aadh_back" },
  { id: "pan", key: "s4_doc_pan" },
  { id: "udyam", key: "s4_doc_udyam" },
  { id: "passport", key: "s4_doc_pass" },
  { id: "bankPassbook", key: "dpr_doc_passbook" },
  { id: "educationCert", key: "dpr_doc_edu" },
  { id: "casteCert", key: "dpr_doc_caste" },
  { id: "landDoc", key: "dpr_doc_land" },
  { id: "electricityBill", key: "dpr_doc_elec" },
];

const STATUS_COLORS = {
  draft: { bg: "#f3f4f6", fg: "#6b7280" },
  submitted: { bg: "#fff7ed", fg: "#F97316" },
  under_review: { bg: "#ede9fe", fg: "#7c3aed" },
  approved: { bg: "#dcfce7", fg: "#16a34a" },
  rejected: { bg: "#fee2e2", fg: "#dc2626" },
};

const heroStyle = {
  position: "relative",
  background: "linear-gradient(125deg, #142952 0%, #1d3f7a 55%, #16305f 100%)",
  borderRadius: 16,
  padding: "26px 28px",
  marginBottom: 18,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(20, 41, 82, 0.25)",
};

const cardStyle = {
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  padding: 20,
  marginBottom: 18,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: C.textopa,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  marginBottom: 4,
};

const valueStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: C.navy,
  wordBreak: "break-word",
};

function formatDate(iso, lang) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (_) {
    return "—";
  }
}

export default function ProfilePage({ onGoForm }) {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [form, setForm] = useState(null);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [f, r] = await Promise.allSettled([getMyForm(), getEditRequest()]);
      if (!alive) return;
      if (f.status === "fulfilled" && f.value.success) setForm(f.value.form);
      if (r.status === "fulfilled" && r.value.success) setRequest(r.value.request);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          height: "60vh",
        }}
      >
        <Spinner size={64} />
        <div style={{ color: C.maroon, fontWeight: 600, fontSize: 15 }}>
          {lang === "mr" ? "प्रोफाइल लोड होत आहे..." : "Loading profile..."}
        </div>
      </div>
    );
  }

  const name = user?.name || form?.section1?.fullName || "";
  const initials = (name.trim()[0] || "?").toUpperCase();
  const docs = form?.section4?.docs || {};
  const uploadedCount = KYC_DOCS.filter((d) => !!docs[d.id]).length;
  const st = form ? STATUS_COLORS[form.status] || STATUS_COLORS.draft : null;
  const addr = form?.section1?.address;
  const location = addr
    ? [addr.village === "__other__" ? addr.villageCustom : addr.village, addr.taluka, addr.dist]
        .filter(Boolean)
        .join(", ")
    : "";
  const copyId = () => {
    if (!form?.uniqueId) return;
    navigator.clipboard?.writeText(form.uniqueId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="profile-page" style={{ textAlign: "left" }}>
      {/* ── A. Header card ── */}
      <div style={heroStyle}>
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 230,
            height: 230,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.35), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: C.orange,
              border: "3px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
              {name || "—"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>📱 {user?.mobile || "—"}</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>✉️ {user?.email || "—"}</span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: user?.emailVerified ? "rgba(22,163,74,0.9)" : "rgba(255,255,255,0.18)",
                  border: user?.emailVerified ? "none" : "1px solid rgba(255,255,255,0.3)",
                  color: "#fff",
                }}
              >
                {user?.emailVerified ? `✓ ${t("profile_verified")}` : t("profile_not_verified")}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
              {t("profile_member_since")}: {formatDate(user?.createdAt || form?.createdAt, lang)}
            </div>
          </div>
        </div>
      </div>

      {/* ── B. Application status ── */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, borderRadius: 2, background: C.orange }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.navy }}>
              {t("profile_app_title")}
            </h3>
          </div>
          {st && (
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 800,
                padding: "5px 14px",
                borderRadius: 999,
                background: st.bg,
                color: st.fg,
              }}
            >
              {t(`profile_status_${form.status}`)}
            </span>
          )}
        </div>

        {!form ? (
          <div style={{ textAlign: "left", padding: "18px 10px" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>📋</div>
            <p style={{ margin: "0 0 16px", fontSize: 14.5, color: C.textopa, fontWeight: 600 }}>
              {t("profile_not_started")}
            </p>
            <button
              onClick={onGoForm}
              style={{
                background: C.maroon,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "13px 28px",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("profile_start_cta")}
            </button>
          </div>
        ) : (
          <>
            {/* Application ID */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background: "rgba(20,41,82,0.05)",
                border: "1.5px solid rgba(20,41,82,0.10)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={labelStyle}>{t("profile_app_id")}</div>
                <div style={{ ...valueStyle, fontSize: 17, letterSpacing: 0.6 }}>
                  {form.uniqueId || "—"}
                </div>
              </div>
              {form.uniqueId && (
                <button
                  onClick={copyId}
                  style={{
                    background: copied ? "#dcfce7" : C.navy,
                    color: copied ? "#166534" : "#fff",
                    border: "none",
                    borderRadius: 8,
                    minHeight: 44,
                    padding: "0 18px",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  {copied ? `✓ ${t("profile_copied")}` : t("profile_copy")}
                </button>
              )}
            </div>

            {/* Summary rows */}
            <div className="profile-rows">
              {form.section1?.education && (
                <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                  <div style={labelStyle}>{t("profile_education")}</div>
                  <div style={valueStyle}>{form.section1.education}</div>
                </div>
              )}
              {location && (
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <div style={labelStyle}>{t("profile_location")}</div>
                  <div style={valueStyle}>{location}</div>
                </div>
              )}
            </div>

            {/* Admin remark */}
            {form.adminRemark && (
              <div
                style={{
                  background: form.status === "rejected" ? "#fee2e2" : "#fff7ed",
                  border: `1px solid ${form.status === "rejected" ? "#fca5a5" : "#fed7aa"}`,
                  color: form.status === "rejected" ? "#991b1b" : "#9a3412",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 13.5,
                  marginTop: 12,
                }}
              >
                <b>{t("profile_remark")}:</b> {form.adminRemark}
              </div>
            )}

            {/* Edit request status */}
            {request && (request.status === "pending" || request.status === "approved") && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: request.status === "approved" ? "#16a34a" : "#F97316",
                  marginTop: 12,
                }}
              >
                {request.status === "approved" ? t("profile_edit_approved") : t("profile_edit_pending")}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── C. KYC documents ── */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 4, height: 16, borderRadius: 2, background: C.orange }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.navy }}>
              {t("profile_kyc_title")}
            </h3>
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: C.navy }}>
            {uploadedCount} / {KYC_DOCS.length} {t("profile_uploaded")}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "rgba(20,41,82,0.10)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.round((uploadedCount / KYC_DOCS.length) * 100)}%`,
              background: uploadedCount === KYC_DOCS.length ? C.green : C.orange,
              borderRadius: 999,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div className="profile-kyc-grid">
          {KYC_DOCS.map((d) => {
            const up = !!docs[d.id];
            return (
              <div
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  background: up ? "rgba(22,163,74,0.06)" : "rgba(20,41,82,0.04)",
                  border: `1.5px solid ${up ? "rgba(22,163,74,0.25)" : "rgba(20,41,82,0.10)"}`,
                  borderRadius: 10,
                  padding: "11px 13px",
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: C.navy,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t(d.key)}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 999,
                    background: up ? "#dcfce7" : "#f3f4f6",
                    color: up ? "#16a34a" : "#6b7280",
                    flexShrink: 0,
                  }}
                >
                  {up ? `✓ ${t("profile_uploaded")}` : `○ ${t("profile_pending")}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .profile-kyc-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .profile-rows { display: flex; gap: 16px; flex-wrap: wrap; }
        @media (max-width: 1024px) {
          .profile-kyc-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 640px) {
          .profile-kyc-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
