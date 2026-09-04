import { useLang } from "../context/LangContext";

export default function CustomerCareButton() {
  const { t } = useLang();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "linear-gradient(135deg, #142952, #1e3a6e)",
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: "0 6px 24px rgba(20,41,82,0.4)",
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: 300,
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
      <a
        href="tel:+918830823679"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          textDecoration: "none",
          color: "#fff",
          fontWeight: 800,
          fontSize: 16,
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          padding: "10px 14px",
          borderRadius: 8,
        }}
      >
        📞 8830823679
      </a>
    </div>
  );
}
