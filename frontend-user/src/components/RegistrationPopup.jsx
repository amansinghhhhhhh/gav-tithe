import { useState } from "react";
import C from "../constants/colors";
import { useLang } from "../context/LangContext";

const LS_KEY = "gtu_popup_dismissed";

export function RegistrationPopup({ onRegister, title, message, points, cta }) {
  const { t } = useLang();
  const [open, setOpen] = useState(() => {
    try {
      return !localStorage.getItem(LS_KEY);
    } catch (_) {
      return true;
    }
  });

  const dismiss = () => {
    try {
      localStorage.setItem(LS_KEY, "1");
    } catch (_) {}
    setOpen(false);
  };

  if (!open) return null;

  const pts =
    points ||
    [1, 2, 3, 4].map((i) => t(`popup_point${i}`));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
      onClick={dismiss}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 420,
          width: "100%",
          padding: "28px 24px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#9ca3af",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F97316, #fbbf24)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            margin: "0 auto 14px",
          }}
        >
          📣
        </div>

        <h2 style={{ margin: "0 0 8px", color: C.navy, fontSize: 19, fontWeight: 800 }}>
          {title || t("popup_title")}
        </h2>
        <p
          style={{
            margin: "0 0 18px",
            color: "#4b5563",
            fontSize: 13.5,
            lineHeight: 1.7,
          }}
        >
          {message || t("popup_message")}
        </p>

        <ul
          style={{
            textAlign: "left",
            margin: "0 0 20px",
            paddingLeft: 18,
            color: "#374151",
            fontSize: 13,
            lineHeight: 1.9,
          }}
        >
          {pts.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>

        <button
          onClick={() => {
            try {
              localStorage.setItem(LS_KEY, "1");
            } catch (_) {}
            setOpen(false);
            if (onRegister) onRegister();
          }}
          style={{
            width: "100%",
            padding: "13px 0",
            background: "linear-gradient(135deg, #F97316, #fb923c)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
          }}
        >
          {cta || t("popup_register_btn")}
        </button>
        <button
          onClick={dismiss}
          style={{
            width: "100%",
            padding: "11px 0",
            marginTop: 8,
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: 10,
            color: "#6b7280",
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
          }}
        >
          {t("popup_later_btn")}
        </button>
      </div>
    </div>
  );
}
