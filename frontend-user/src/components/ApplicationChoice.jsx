import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { getMyForm, getMySevaApps } from "../services/api";
import { Spinner } from "../components/shared/Spinner";
import C from "../constants/colors";

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

export default function ApplicationChoice({ onOpenGtu }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gtuStatus, setGtuStatus] = useState(null); // null = not started
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

  if (loading)
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, height: "55vh" }}>
        <Spinner size={52} />
        <div style={{ color: C.maroon, fontWeight: 600 }}>{t("loading")}</div>
      </div>
    );

  const sevaStatus = sevaApps.length === 0 ? "not_started" : sevaApps[0].status;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1 style={{ color: C.navy, fontSize: 26, fontWeight: 800, margin: 0 }}>{t("choice_title")}</h1>
        <p style={{ color: C.textopa, fontSize: 14.5, marginTop: 8 }}>{t("choice_sub")}</p>
      </div>

      {/* 2 bold cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 24,
        }}
      >
        {/* ── GTU Abhiyan card ── */}
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
                🏭
              </span>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0, lineHeight: 1.25 }}>{t("choice_gtu_title")}</h2>
                <div style={{ marginTop: 8 }}>
                  <StatusPill statusKey={gtuStatus === null ? "not_started" : gtuStatus} t={t} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: "22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
            <p style={{ color: C.textopa, fontSize: 14, lineHeight: 1.65, margin: "0 0 22px" }}>{t("choice_gtu_desc")}</p>
            <button
              onClick={() => onOpenGtu && onOpenGtu(gtuStatus === "submitted")}
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              {gtuStatus === "submitted" ? t("choice_gtu_view") : gtuStatus === "draft" ? t("choice_gtu_continue") : t("choice_gtu_apply")} →
            </button>
          </div>
        </div>

        {/* ── Seva First card ── */}
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
                💡
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              {sevaApps.length === 0 ? t("choice_seva_apply") : t("choice_seva_view")} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
