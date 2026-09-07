import { useState } from "react";
import { useLang } from "../context/LangContext";

const faqs = [
  { qKey: "faq_q1", aKey: "faq_a1" },
  { qKey: "faq_q2", aKey: "faq_a2" },
  { qKey: "faq_q3", aKey: "faq_a3" },
  { qKey: "faq_q4", aKey: "faq_a4" },
  { qKey: "faq_q5", aKey: "faq_a5" },
];

export default function FaqModal({ open, onClose }) {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState(null);

  if (!open) return null;

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
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #f3f4f6",
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            {t("faq_title")}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: "none",
              background: "#f3f4f6",
              color: "#6b7280",
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

        {/* FAQ List */}
        <div style={{ overflowY: "auto", padding: "8px 0" }}>
          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{ borderBottom: "1px solid #f3f4f6" }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "14px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span>{t(faq.qKey)}</span>
                <span
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    transition: "transform 0.2s",
                    transform: openIdx === i ? "rotate(90deg)" : "rotate(0deg)",
                    flexShrink: 0,
                  }}
                >
                  ▸
                </span>
              </button>
              {openIdx === i && (
                <div
                  style={{
                    padding: "0 20px 14px",
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.6,
                  }}
                >
                  {t(faq.aKey)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
