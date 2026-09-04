import { useState } from "react";
import { useLang } from "../context/LangContext";

export default function CustomerCareButton() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        @keyframes ccPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.6); }
          50% { box-shadow: 0 4px 18px rgba(249,115,22,0.45), 0 0 0 12px rgba(249,115,22,0); }
        }
      `}</style>
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          fontFamily: "'Segoe UI', sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 6px",
            fontSize: 11,
            fontWeight: 700,
            color: "#142952",
            background: "#fff",
            padding: "4px 10px",
            borderRadius: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {t("cc_button")}
        </p>

        <div style={{ position: "relative" }}>
          {open && (
            <a
              href="tel:+918830823679"
              style={{
                display: "block",
                background: "linear-gradient(135deg, #142952, #1e3a6e)",
                borderRadius: 14,
                padding: "16px 20px",
                boxShadow: "0 6px 24px rgba(20,41,82,0.4)",
                width: 280,
                textDecoration: "none",
                position: "absolute",
                bottom: 0,
                right: 66,
              }}
            >
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {t("cc_title")}
              </p>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.5,
                }}
              >
                {t("cc_contact")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  background: "linear-gradient(135deg, #16a34a, #22c55e)",
                  padding: "10px 14px",
                  borderRadius: 8,
                }}
              >
                📞 8830823679
              </div>
            </a>
          )}

          <button
            onClick={() => setOpen(!open)}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: open
                ? "linear-gradient(135deg, #dc2626, #ef4444)"
                : "linear-gradient(135deg, #F97316, #fb923c)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              animation: open ? "none" : "ccPulse 2s infinite",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {open ? "✕" : "📞"}
          </button>
        </div>
      </div>
    </>
  );
}
