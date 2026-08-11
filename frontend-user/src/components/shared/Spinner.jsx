import guicon from "../../assets/guicon.svg";

// General purpose spinning guicon loader
export function Spinner({ size = 40, style = {} }) {
  return (
    <img
      src={guicon}
      alt=""
      style={{
        width: size,
        height: size,
        animation: "gu-spin 1s linear infinite",
        display: "block",
        ...style,
      }}
    />
  );
}

// OTP verify ke liye — spinning guicon with pulsing orange rings
export function OtpVerifyLoader() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "16px 0 8px",
      }}
    >
      <div style={{ position: "relative", width: 56, height: 56 }}>
        {/* Ring 1 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(249,115,22,0.25)",
            animation: "gu-ring 1.4s ease-out infinite",
          }}
        />
        {/* Ring 2 — delayed */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "rgba(249,115,22,0.15)",
            animation: "gu-ring2 1.4s ease-out 0.5s infinite",
          }}
        />
        {/* Spinning guicon in center */}
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(249,115,22,0.3)",
          }}
        >
          <img
            src={guicon}
            alt=""
            style={{
              width: 28,
              height: 28,
              animation: "gu-spin 1s linear infinite",
            }}
          />
        </div>
      </div>
      <span style={{ fontSize: 13, color: "#F97316", fontWeight: 600 }}>
        Verifying OTP...
      </span>
    </div>
  );
}
