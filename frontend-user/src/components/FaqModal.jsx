import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";

export default function FaqModal({ open, onClose, faqs = [], titleKey = "faq_title" }) {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    setOpenIdx(null);
  }, [open]);

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
      <style>{`
        .faq-scroll::-webkit-scrollbar { width: 6px; }
        .faq-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .faq-scroll::-webkit-scrollbar-thumb { background: #F97316; border-radius: 10px; }
        .faq-scroll::-webkit-scrollbar-thumb:hover { background: #ea580c; }
      `}</style>
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
            background: "linear-gradient(135deg, #F97316 0%, #fb923c 60%, #fbbf24 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            flexShrink: 0,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
            {t(titleKey)}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
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

        {/* FAQ List */}
        <div
          className="faq-scroll"
          style={{ overflowY: "auto", padding: "8px 0" }}
        >
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
                    textAlign: "left",
                  }}
                >
                  {t(faq.aKey).split('\n').map((line, idx) => {
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);
                    return (
                      <p key={idx} style={{ margin: idx > 0 ? '8px 0 0' : '0' }}>
                        {parts.map((part, i) =>
                          urlRegex.test(part) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#F97316", fontWeight: 600, textDecoration: "underline" }}
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
