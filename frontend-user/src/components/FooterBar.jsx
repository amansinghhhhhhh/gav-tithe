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
        justifyContent: "flex-end",
        gap: 12,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.07)",
        marginTop: 8,
      }}
    >
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

      <button
        onClick={onSaveDraft}
        style={{
          padding: "10px 20px",
          background: "none",
          border: "1.5px solid #d1d5db",
          color: C.textopa,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {t("save_draft")}
      </button>

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
  );
}
