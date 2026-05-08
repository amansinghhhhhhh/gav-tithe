import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useOtp from "../hooks/useOtp";
import { loginEmail, registerEmail } from "../services/api";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";

const inp = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const btn = (bg = C.maroon) => ({
  width: "100%",
  padding: "12px 0",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { otpSent, otpVerified, loading, error, sendOtp, verifyOtp } = useOtp();

  const [tab, setTab] = useState("otp");
  const [isSignup, setIsSignup] = useState(false);

  // OTP fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");

  // Email fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailName, setEmailName] = useState("");
  const [err, setErr] = useState("");

  // ── OTP Flow ──────────────────────────────────────────────────────────────
  const handleSendOtp = () => {
    setErr("");
    if (!name.trim()) {
      setErr("Naam daalo");
      return;
    }
    if (mobile.length !== 10) {
      setErr("Valid 10-digit number daalo");
      return;
    }
    sendOtp(mobile);
  };

  const handleVerifyOtp = async () => {
    console.log("Name being sent:", name); // ← add karo
    if (otp.length < 4) {
      setErr("OTP daalo");
      return;
    }
    const data = await verifyOtp(otp, mobile, name);
    console.log("🔍 OTP verify response:", data); // ← add karo
    if (data?.success) {
      login(data.user);
      console.log("👤 User set:", data.user); // ← add karo
      navigate("/dashboard");
    }
  };

  // ── Email Flow ────────────────────────────────────────────────────────────
  const handleEmail = async () => {
    setErr("");
    if (isSignup && !emailName.trim()) {
      setErr("Naam daalo");
      return;
    }
    if (!email || !password) {
      setErr("Email aur password daalo");
      return;
    }

    const data = isSignup
      ? await registerEmail(email, password, mobile, emailName)
      : await loginEmail(email, password);

    if (data?.success) {
      login(data.user);
      navigate("/dashboard");
    } else {
      setErr(data?.message || "Login fail hua");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.light,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div id="recaptcha-container" />

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#F97316",
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              color: "#fff",
              marginBottom: 10,
            }}
          >
            गाव
          </div>
          <h2
            style={{
              margin: 0,
              color: C.maroon,
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            Gaon Tithe Udyojak
          </h2>
          <p style={{ margin: "4px 0 0", color: "#777", fontSize: 13 }}>
            गाव तिथे उद्योजक — Login
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          style={{
            display: "flex",
            background: C.light,
            borderRadius: 10,
            padding: 4,
            marginBottom: 22,
          }}
        >
          {["otp", "email"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setErr("");
              }}
              style={{
                flex: 1,
                padding: "9px 0",
                border: "none",
                borderRadius: 8,
                background: tab === t ? "#fff" : "transparent",
                color: tab === t ? C.maroon : "#888",
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              }}
            >
              {t === "otp" ? "📱 Mobile OTP" : "✉️ Email"}
            </button>
          ))}
        </div>

        {/* Error */}
        {(err || error) && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #f5c0c0",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#c0392b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ⚠ {err || error}
          </div>
        )}

        {/* ── OTP Tab ── */}
        {tab === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Name field */}
            <input
              style={inp}
              placeholder="Aapka Naam (Full Name)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={otpSent}
            />

            {/* Mobile field */}
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  ...inp,
                  width: 52,
                  textAlign: "center",
                  background: "#f5f5f5",
                  color: "#555",
                }}
              >
                +91
              </div>
              <input
                style={{ ...inp, flex: 1 }}
                placeholder="Mobile Number"
                value={mobile}
                maxLength={10}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                disabled={otpSent}
              />
            </div>

            {!otpSent ? (
              <button
                style={btn("#F97316")}
                onClick={handleSendOtp}
                disabled={loading}
              >
                {loading ? "Bhej raha hai..." : "OTP Bhejo"}
              </button>
            ) : (
              <>
                <input
                  style={inp}
                  placeholder="6-digit OTP daalo"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  style={btn(C.maroon)}
                  onClick={handleVerifyOtp}
                  disabled={loading || otpVerified}
                >
                  {loading
                    ? "Verify ho raha hai..."
                    : otpVerified
                      ? "✅ Verified!"
                      : "OTP Verify Karo"}
                </button>
                <button
                  onClick={() => sendOtp(mobile)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#F97316",
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  OTP dobara bhejo
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Email Tab ── */}
        {tab === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isSignup && (
              <input
                style={inp}
                placeholder="Aapka Naam (Full Name)"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
              />
            )}
            <input
              style={inp}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={inp}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isSignup && (
              <input
                style={inp}
                placeholder="Mobile (optional)"
                value={mobile}
                maxLength={10}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              />
            )}
            <button style={btn(C.maroon)} onClick={handleEmail}>
              {isSignup ? "Account Banao" : "Login Karo"}
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#777",
                margin: 0,
              }}
            >
              {isSignup ? "Already account hai? " : "Naya account? "}
              <span
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErr("");
                }}
                style={{ color: C.maroon, cursor: "pointer", fontWeight: 600 }}
              >
                {isSignup ? "Login karo" : "Register karo"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
