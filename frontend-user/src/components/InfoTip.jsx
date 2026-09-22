import { useState } from "react";
import { useLang } from "../context/LangContext";

export default function InfoTip({ textKey, size = 16, align = "center" }) {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  const isRight = align === "right";
  const isLeft = align === "left";

  const tipPos = isRight
    ? { right: -4, left: "auto", transform: "none" }
    : isLeft
      ? { left: -4, right: "auto", transform: "none" }
      : { left: "50%", right: "auto", transform: "translateX(-50%)" };

  const arrowPos = isRight
    ? { right: 10, left: "auto", transform: "none" }
    : isLeft
      ? { left: 10, right: "auto", transform: "none" }
      : { left: "50%", right: "auto", transform: "translateX(-50%)" };

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        verticalAlign: "middle",
        marginLeft: 5,
        lineHeight: 0,
      }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={(e) => {
        e.stopPropagation();
        setShow((s) => !s);
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: show ? "#F97316" : "#fff7ed",
          border: `1.5px solid #F97316`,
          color: show ? "#fff" : "#F97316",
          fontSize: size * 0.62,
          fontWeight: 700,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
          paddingBottom: size * 0.06,
          transition: "all 0.15s",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        i
      </span>
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 9px)",
            ...tipPos,
            background: "#fff7ed",
            border: "1.5px solid #fb923c",
            color: "#9a3412",
            fontSize: 12,
            lineHeight: 1.55,
            padding: "8px 11px",
            borderRadius: 10,
            width: 210,
            whiteSpace: "normal",
            boxShadow: "0 6px 18px rgba(249,115,22,0.18)",
            zIndex: 100,
            pointerEvents: "none",
            textAlign: "left",
            fontWeight: 500,
            animation: isRight
              ? "infoTipInRight 0.15s ease-out"
              : isLeft
                ? "infoTipInLeft 0.15s ease-out"
                : "infoTipIn 0.15s ease-out",
          }}
        >
          {t(textKey)}
          <span
            style={{
              position: "absolute",
              top: "100%",
              ...arrowPos,
              width: 0,
              height: 0,
              border: "6px solid transparent",
              borderTopColor: "#fb923c",
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "100%",
              ...arrowPos,
              width: 0,
              height: 0,
              border: "5px solid transparent",
              borderTopColor: "#fff7ed",
              marginTop: -1,
            }}
          />
        </span>
      )}
      <style>{`
        @keyframes infoTipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes infoTipInRight {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes infoTipInLeft {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </span>
  );
}
