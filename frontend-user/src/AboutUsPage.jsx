import { useState } from "react";
import { useLang } from "./context/LangContext";
import C from "./constants/colors";
import MACCIAlogo from "./assets/MACCIAlogo.svg";

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

const TABS = ["maccia", "abhiyan", "manch"];

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 4, height: 16, borderRadius: 2, background: C.orange }} />
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.navy }}>{children}</h3>
    </div>
  );
}

function StatsRow({ items }) {
  return (
    <div className="about-stats">
      {items.map((s) => (
        <div
          key={s.label}
          style={{
            flex: "1 1 150px",
            minWidth: 0,
            textAlign: "center",
            background: "rgba(20,41,82,0.05)",
            border: "1.5px solid rgba(20,41,82,0.10)",
            borderRadius: 12,
            padding: "16px 12px",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, color: C.orange, lineHeight: 1.1 }}>
            {s.value}
          </div>
          <div style={{ ...labelStyle, marginTop: 6, marginBottom: 0 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function AboutUsPage({ onNav }) {
  const { t } = useLang();
  const [tab, setTab] = useState("maccia");

  return (
    <div className="about-page" style={{ textAlign: "left" }}>
      {/* ── Hero + segmented tabs ── */}
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
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
            <img
              src={MACCIAlogo}
              alt="MACCIA"
              style={{ height: 52, width: "auto", background: "#fff", borderRadius: 10, padding: "6px 10px" }}
            />
            <div style={{ minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                {t("about_tab_maccia")}
              </h2>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
                Gaon Tithe Udyojak
              </div>
            </div>
          </div>

          <div
            className="about-tabs"
            style={{
              display: "flex",
              gap: 6,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 5,
              flexWrap: "wrap",
            }}
          >
            {TABS.map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: "1 1 auto",
                  minWidth: 110,
                  padding: "11px 14px",
                  borderRadius: 9,
                  border: "none",
                  background: tab === k ? C.orange : "transparent",
                  color: "#fff",
                  fontSize: 13.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s ease",
                }}
              >
                {t(`about_tab_${k}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab 1: MACCIA ── */}
      {tab === "maccia" && (
        <>
          <div style={cardStyle}>
            <SectionTitle>{t("about_maccia_title")}</SectionTitle>
            <div style={labelStyle}>{t("about_apex_label")}</div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
              {t("about_apex_text")}
            </p>
          </div>

          <div style={cardStyle}>
            <StatsRow
              items={[
                { value: "100", label: t("about_stat_years") },
                { value: "350+", label: t("about_stat_members") },
                { value: "36", label: t("about_stat_districts") },
              ]}
            />
          </div>

          <div style={cardStyle}>
            <SectionTitle>{t("about_idea_label")}</SectionTitle>
            <div style={{ ...valueStyle, fontSize: 16, fontWeight: 800, color: C.maroon, marginBottom: 8 }}>
              {t("about_idea_role")}
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
              {t("about_idea_text")}
            </p>
          </div>
        </>
      )}

      {/* ── Tab 2: The Abhiyan ── */}
      {tab === "abhiyan" && (
        <>
          <div style={cardStyle}>
            <SectionTitle>{t("about_abhiyan_title")}</SectionTitle>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.orange, marginBottom: 10 }}>
              {t("about_abhiyan_sub")}
            </div>
            <div style={labelStyle}>{t("about_mission_label")}</div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
              {t("about_mission_text")}
            </p>
          </div>

          <div style={cardStyle}>
            <StatsRow
              items={[
                { value: "36,000", label: t("about_stat_entrepreneurs") },
                { value: "3 Lakh", label: t("about_stat_employment") },
                { value: "₹3,600 Cr", label: t("about_stat_turnover") },
              ]}
            />
          </div>
        </>
      )}

      {/* ── Tab 3: Udyog Vichar Manch ── */}
      {tab === "manch" && (
        <>
          <div style={cardStyle}>
            <SectionTitle>{t("about_manch_title")}</SectionTitle>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.orange, marginBottom: 10 }}>
              {t("about_manch_sub")}
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: C.text }}>
              {t("about_manch_text")}
            </p>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Framework</div>
            <div className="about-feats">
              {["about_f1", "about_f2", "about_f3", "about_f4", "about_f5"].map((k, i) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    background: "rgba(20,41,82,0.04)",
                    border: "1.5px solid rgba(20,41,82,0.10)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: C.navy,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>
                    {t(k)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => onNav("profile")}
              style={{
                flex: "1 1 220px",
                background: C.orange,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 24px",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              {t("about_btn_profile")}
            </button>
            <button
              onClick={() => onNav("ecosystem")}
              style={{
                flex: "1 1 220px",
                background: C.navy,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "14px 24px",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
                minHeight: 48,
              }}
            >
              {t("about_btn_ecosystem")}
            </button>
          </div>
        </>
      )}

      <style>{`
        .about-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .about-feats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        @media (max-width: 768px) {
          .about-feats { grid-template-columns: 1fr; }
          .about-tabs button { min-width: 0 !important; padding: 10px 8px !important; font-size: 12.5px !important; }
        }
      `}</style>
    </div>
  );
}
