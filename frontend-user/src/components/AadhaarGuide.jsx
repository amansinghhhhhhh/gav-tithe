import { useLang } from "../context/LangContext";
import C from "../constants/colors";

function AadhaarCardSvg({ side = "front", width = 160 }) {
  const h = Math.round(width * 0.63);
  return (
    <svg viewBox="0 0 160 100" width={width} height={h} style={{ display: "block", borderRadius: 6 }}>
      <rect x="1" y="1" width="158" height="98" rx="7" fill="#fdfdf6" stroke="#c9c9b8" strokeWidth="2" />
      <rect x="3" y="3" width="154" height="4" rx="2" fill="#F97316" />
      <rect x="3" y="8" width="154" height="3" fill="#16a34a" />
      <text x="80" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill={C.maroon} fontFamily="sans-serif">
        {side === "front" ? "भारतीय विशिष्ट पहचान प्राधिकरण" : "UNIQUE IDENTIFICATION AUTHORITY OF INDIA"}
      </text>
      {side === "front" ? (
        <>
          <rect x="10" y="26" width="34" height="44" rx="4" fill="#e5e7eb" stroke="#b0b3b8" />
          <circle cx="27" cy="42" r="9" fill="#9aa0a6" />
          <path d="M 13 68 a 14 12 0 0 1 28 0" fill="#9aa0a6" />
          <text x="52" y="38" fontSize="7" fontWeight="600" fill="#4b5563" fontFamily="sans-serif">RAHUL</text>
          <text x="52" y="47" fontSize="7" fontWeight="600" fill="#4b5563" fontFamily="sans-serif">SHARMA</text>
          <rect x="52" y="56" width="60" height="4" rx="2" fill="#cbd5e1" />
          <rect x="52" y="64" width="44" height="4" rx="2" fill="#cbd5e1" />
          <text x="80" y="92" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1.2" fill="#1f2937" fontFamily="sans-serif">
            1234 5678 9012
          </text>
          <rect x="120" y="26" width="30" height="30" fill="#fff" stroke="#9aa0a6" />
          <g fill="#1f2937">
            <rect x="123" y="29" width="6" height="6" /><rect x="131" y="29" width="4" height="4" />
            <rect x="137" y="31" width="5" height="5" /><rect x="144" y="29" width="4" height="6" />
            <rect x="123" y="37" width="4" height="5" /><rect x="130" y="36" width="6" height="6" />
            <rect x="138" y="39" width="4" height="4" /><rect x="145" y="38" width="5" height="5" />
            <rect x="124" y="46" width="5" height="7" /><rect x="132" y="46" width="5" height="4" />
            <rect x="139" y="47" width="6" height="5" /><rect x="146" y="47" width="3" height="6" />
          </g>
        </>
      ) : (
        <>
          <rect x="10" y="26" width="46" height="46" fill="#fff" stroke="#9aa0a6" />
          <g fill="#1f2937">
            <rect x="14" y="30" width="8" height="8" /><rect x="24" y="30" width="5" height="5" />
            <rect x="31" y="33" width="6" height="6" /><rect x="40" y="30" width="5" height="8" />
            <rect x="14" y="40" width="5" height="6" /><rect x="22" y="38" width="8" height="8" />
            <rect x="32" y="42" width="5" height="5" /><rect x="41" y="41" width="6" height="6" />
            <rect x="15" y="51" width="6" height="9" /><rect x="24" y="49" width="6" height="5" />
            <rect x="33" y="52" width="8" height="6" /><rect x="44" y="51" width="4" height="8" />
            <rect x="14" y="62" width="7" height="6" /><rect x="25" y="63" width="5" height="5" />
            <rect x="33" y="64" width="6" height="5" /><rect x="42" y="62" width="5" height="7" />
          </g>
          <text x="64" y="30" fontSize="6.5" fontWeight="700" fill={C.maroon} fontFamily="sans-serif">पत्ता / Address</text>
          <rect x="64" y="35" width="84" height="5" rx="2" fill="#cbd5e1" />
          <rect x="64" y="44" width="76" height="5" rx="2" fill="#cbd5e1" />
          <rect x="64" y="53" width="84" height="5" rx="2" fill="#cbd5e1" />
          <rect x="64" y="62" width="60" height="5" rx="2" fill="#cbd5e1" />
          <text x="80" y="92" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1.2" fill="#1f2937" fontFamily="sans-serif">
            1234 5678 9012
          </text>
        </>
      )}
    </svg>
  );
}

const panelStyle = (ok) => ({
  flex: "1 1 140px",
  minWidth: 140,
  border: `1.5px solid ${ok ? C.green : "#e5e7eb"}`,
  background: ok ? "#f0fdf4" : "#fff",
  borderRadius: 10,
  padding: "10px 8px",
  textAlign: "center",
});

const captionStyle = { fontSize: 12, fontWeight: 700, marginTop: 6 };
const subStyle = { fontSize: 10, color: "#6b7280", marginTop: 2, lineHeight: 1.35 };

function Panel({ ok, icon, label, sub, children }) {
  return (
    <div style={panelStyle(ok)}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {children}
        <span
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: ok ? C.green : "#dc2626",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: "22px",
            border: "2px solid #fff",
            boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          }}
        >
          {icon}
        </span>
      </div>
      <div style={{ ...captionStyle, color: ok ? C.green : "#dc2626" }}>{label}</div>
      <div style={subStyle}>{sub}</div>
    </div>
  );
}

function AadhaarGuide() {
  const { t } = useLang();
  return (
    <div
      style={{
        border: "1.5px dashed #f59e0b",
        background: "#fffbeb",
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Panel ok icon="✓" label={t("guide_good")} sub={t("guide_good_sub")}>
          <div style={{ transform: "rotate(-3deg)" }}>
            <AadhaarCardSvg side="front" />
          </div>
        </Panel>
        <Panel ok={false} icon="✗" label={t("guide_blur")} sub={t("guide_blur_sub")}>
          <div style={{ filter: "blur(2.2px)" }}>
            <AadhaarCardSvg side="front" />
          </div>
        </Panel>
        <Panel ok={false} icon="✗" label={t("guide_glare")} sub={t("guide_glare_sub")}>
          <div style={{ position: "relative" }}>
            <AadhaarCardSvg side="front" />
            <div
              style={{
                position: "absolute",
                top: 2,
                left: 14,
                width: 70,
                height: 34,
                background: "radial-gradient(ellipse at center, rgba(255,255,255,.95) 0%, rgba(255,255,255,0) 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 6,
                left: 34,
                width: 74,
                height: 15,
                borderRadius: 9,
                background: "rgba(245,158,11,.85)",
                border: "1px solid #b45309",
                transform: "rotate(-6deg)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 2,
                left: 76,
                width: 66,
                height: 14,
                borderRadius: 9,
                background: "rgba(251,191,36,.85)",
                border: "1px solid #b45309",
                transform: "rotate(4deg)",
                pointerEvents: "none",
              }}
            />
          </div>
        </Panel>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 10, textAlign: "center" }}>
        📱 {t("guide_rules")}
      </div>
    </div>
  );
}

export default AadhaarGuide;
