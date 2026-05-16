import C from "./constants/colors";
import { useLang } from "./context/LangContext";

export function SuccessPage() {
  const { t } = useLang();
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          background: C.green,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 44,
          color: "#fff",
        }}
      >
        ✓
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: C.green, margin: 0 }}>
        {t("success_msg")}
      </p>
    </div>
  );
}
