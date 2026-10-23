import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { getMyForm, getMySevaApps } from "../services/api";
import { Spinner } from "../components/shared/Spinner";
import C from "../constants/colors";
import gulogo from "../assets/gulogotransparent.png";
import { Factory, Lightbulb, LogOut, ArrowRight } from "lucide-react";

const STATUS_STYLE = {
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "choice_status_draft" },
  submitted: { bg: "#fff7ed", color: "#F97316", label: "choice_status_submitted" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "choice_status_under_review" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "choice_status_approved" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "choice_status_rejected" },
  not_started: { bg: "#f3f4f6", color: "#6b7280", label: "choice_not_started" },
};

function StatusPill({ statusKey, t }) {
  const s = STATUS_STYLE[statusKey] || STATUS_STYLE.not_started;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: s.bg,
        color: s.color,
        padding: "5px 14px",
        borderRadius: 20,
        fontSize: 12.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
      {t(s.label)}
    </span>
  );
}

export default function ApplicationChoice() {
  const { t, lang, setLang } = useLang();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gtuStatus, setGtuStatus] = useState(null);
  const [sevaApps, setSevaApps] = useState([]);

  useEffect(() => {
    (async () => {
      const [formRes, sevaRes] = await Promise.all([
        getMyForm().catch(() => null),
        getMySevaApps().catch(() => null),
      ]);
      if (formRes?.success && formRes.form) {
        const f = formRes.form;
        if (f.status === "submitted" && !f.editAllowed) setGtuStatus("submitted");
        else setGtuStatus("draft");
      }
      if (sevaRes?.success && Array.isArray(sevaRes.applications)) {
        setSevaApps(sevaRes.applications);
      }
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  if (loading)
    return (
      <div style={{ minHeight: "100vh", background: C.light, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <Spinner size={52} />
        <div style={{ color: C.maroon, fontWeight: 600 }}>{t("loading")}</div>
      </div>
    );

  const sevaStatus = sevaApps.length === 0 ? "not_started" : sevaApps[0].status;

  return (
    <div style={{ minHeight: "100vh", background: C.light, fontFamily: "'Inter', 'Noto Sans Devanagari', 'Segoe UI', sans-serif" }}>
      {/* Top bar */}
      <div
        style={{
          background: C.navy,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        }}
      >
        <img src={gulogo} alt="GTU" style={{ height: 42, width: "auto" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", background: C.navyDark || "#0d1b38", borderRadius: 10, padding: 4, gap: 4 }}>
            {["en", "mr"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: lang === l ? C.orange : "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {l === "en" ? "EN" : "मराठी"}
              </button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              borderRadius: 10,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <LogOut size={14} /> {lang === "mr" ? "साइन आउट" : "Sign Out"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 34 }}>
          <h1 style={{ color: C.navy, fontSize: 28, fontWeight: 800, margin: 0 }}>{t("choice_title")}</h1>
          <p style={{ color: C.textopa, fontSize: 14.5, marginTop: 10 }}>{t("choice_sub")}</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 24,
          }}
        >
          {/* GTU Abhiyan card */}
          <div
            style={{
              background: C.white,
              borderRadius: 18,
              border: "1px solid #e2e8f0",
              boxShadow: "0 6px 24px rgba(20,41,82,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: `linear-gradient(135deg, ${C.navy}, ${C.navyDark || "#0d1b38"})`,
                padding: "26px 24px",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  <Factory size={26} />
                </span>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{t("choice_gtu_title")}</h2>
                  <div style={{ marginTop: 8 }}>
                    <StatusPill statusKey={gtuStatus || "not_started"} t={t} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
              <p style={{ color: "#334155", fontSize: 16, fontWeight: 500, lineHeight: 1.65, margin: "0 0 22px" }}>{t("choice_gtu_desc")}</p>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  marginTop: "auto",
                  background: C.orange,
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 22px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                  transition: "filter .15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                {gtuStatus === "submitted" ? t("choice_gtu_view") : gtuStatus === "draft" ? t("choice_gtu_continue") : t("choice_gtu_apply")} <ArrowRight size={17} />
              </button>
            </div>
          </div>

          {/* Seva First card */}
          <div
            style={{
              background: C.white,
              borderRadius: 18,
              border: "1px solid #e2e8f0",
              boxShadow: "0 6px 24px rgba(230,81,0,0.08)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #e65100, #f57c00)",
                padding: "26px 24px",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    flexShrink: 0,
                  }}
                >
                  <Lightbulb size={26} />
                </span>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{t("choice_seva_title")}</h2>
                  <div style={{ marginTop: 8 }}>
                    <StatusPill statusKey={sevaStatus} t={t} />
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
              <p style={{ color: C.textopa, fontSize: 14, lineHeight: 1.65, margin: "0 0 12px" }}>{t("choice_seva_desc")}</p>
              {sevaApps.length > 0 && (
                <div
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: 10,
                    padding: "10px 14px",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#9a3412",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span>
                    {t("choice_seva_apps")}: <b>{sevaApps.length}</b>
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: 12 }}>{sevaApps[0].uniqueId}</span>
                </div>
              )}
              <button
                onClick={() => navigate("/seva-first")}
                style={{
                  marginTop: "auto",
                  background: "linear-gradient(135deg, #e65100, #f57c00)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "14px 22px",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(230,81,0,0.35)",
                  transition: "filter .15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.07)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                {sevaApps.length === 0 ? t("choice_seva_apply") : t("choice_seva_view")} <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
