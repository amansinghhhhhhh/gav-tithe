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
    <>
    <div className="footer-bar">
      {step > 1 && (
        <button
          onClick={onBack}
          style={{
            padding: "10px 12px",
            background: "#f0f0f0",
            color: C.black,
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t("btn_back")}
        </button>
      )}

      <button
        onClick={onSaveDraft}
        style={{
          padding: "10px 12px",
          background: "none",
          border: "1.5px solid #d1d5db",
          color: C.textopa,
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {t("save_draft")}
      </button>

      {isLast ? (
        <button
          onClick={onSubmit}
          style={{
            padding: "10px 16px",
            background: C.maroon,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t("btn_submit")}
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{
            padding: "10px 16px",
            background: C.maroon,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 13,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t("btn_next")}
        </button>
      )}
    </div>
    <style>{`
      .footer-bar {
        background: #fff;
        border-radius: 12px;
        padding: 14px 24px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        gap: 12px;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.07);
        margin-top: 8px;
      }
      @media (max-width: 640px) {
        .footer-bar { padding: 12px 12px; justify-content: space-between; gap: 8px; }
      }
    `}</style>
    </>
  );
}
