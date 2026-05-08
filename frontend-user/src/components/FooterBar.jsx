import { useLang } from "../context/LangContext";
import C from "../constants/colors";

export function FooterBar({
  step,
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
  isLast,
}) {
  const { t } = useLang();

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.07)",
        marginTop: 8,
      }}
    >
      <button
        onClick={onSaveDraft}
        style={{
          background: "none",
          border: "none",
          color: C.textopa,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {t("save_draft")}
      </button>

      <div style={{ display: "flex", gap: 12 }}>
        {step > 1 && (
          <button
            onClick={onBack}
            style={{
              padding: "10px 24px",
              background: "#f0f0f0",
              color: C.black,
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t("btn_back")}
          </button>
        )}

        {isLast ? (
          <button
            onClick={onSubmit}
            style={{
              padding: "10px 28px",
              background: C.maroon,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t("btn_submit")}
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              padding: "10px 28px",
              background: C.maroon,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {t("btn_next")}
          </button>
        )}
      </div>
    </div>
  );
}
