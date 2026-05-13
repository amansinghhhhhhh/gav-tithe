import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useOtp from "../hooks/useOtp";
import { loginEmail, registerEmail } from "../services/api";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import gulogotransparent from "../assets/gulogotransparent.png";
import { useLang } from "../context/LangContext";

// ── Hook: screen size detect ──────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  return isMobile;
}

const inp = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #ddd",
  borderRadius: 8,
  fontSize: 16,
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
  const { t } = useLang();
  const isMobile = useIsMobile();

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
      setErr(t("login_name_placeholder"));
      return;
    }
    if (mobile.length !== 10) {
      setErr("Valid 10-digit number daalo");
      return;
    }
    sendOtp(mobile);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setErr(t("login_input_otp_placeholder"));
      return;
    }
    const data = await verifyOtp(otp, mobile, name);
    if (data?.success) {
      login(data.user);
      navigate("/dashboard");
    }
  };

  // ── Email Flow ────────────────────────────────────────────────────────────
  const handleEmail = async () => {
    setErr("");
    if (isSignup && !emailName.trim()) {
      setErr(t("login_name_placeholder"));
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
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: C.light,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: isMobile ? "16px 12px" : "24px",
        }}
      >
        <div id="recaptcha-container" />

        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: isMobile ? "24px 16px" : "36px 32px",
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              style={{ width: isMobile ? 160 : 200 }}
              src={gulogotransparent}
              alt="logo"
            />
            <h2
              style={{
                margin: "8px 0 0",
                color: C.maroon,
                fontWeight: 800,
                fontSize: isMobile ? 17 : 20,
              }}
            >
              {t("login_title")}
            </h2>
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
            {["otp", "email"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTab(type);
                  setErr("");
                }}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  border: "none",
                  borderRadius: 8,
                  background: tab === type ? "#fff" : "transparent",
                  color: tab === type ? C.maroon : "#888",
                  fontWeight: tab === type ? 700 : 400,
                  fontSize: 13,
                  cursor: "pointer",
                  boxShadow:
                    tab === type ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                }}
              >
                {type === "otp"
                  ? `📱 ${t("login_otp")}`
                  : `✉️ ${t("login_email")}`}
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
              <input
                style={inp}
                placeholder={t("login_name_placeholder")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={otpSent}
              />

              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    ...inp,
                    width: 52,
                    textAlign: "center",
                    background: "#f5f5f5",
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  +91
                </div>
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder={t("login_number_placeholder")}
                  value={mobile}
                  maxLength={10}
                  inputMode="numeric"
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
                  {loading ? "Sending..." : t("login_send_otp")}
                </button>
              ) : (
                <>
                  <input
                    style={inp}
                    placeholder={t("login_input_otp_placeholder")}
                    value={otp}
                    maxLength={6}
                    inputMode="numeric"
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
                        ? t("login_otp_verifed")
                        : t("login_otp_verify")}
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
                    {t("login_otp_resend")}
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
                  placeholder={t("login_name_placeholder")}
                  value={emailName}
                  onChange={(e) => setEmailName(e.target.value)}
                />
              )}
              <input
                style={inp}
                type="email"
                inputMode="email"
                placeholder={t("login_email_placeholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                style={inp}
                type="password"
                placeholder={t("login_password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {isSignup && (
                <input
                  style={inp}
                  placeholder={t("login_mobile_optional")}
                  value={mobile}
                  maxLength={10}
                  inputMode="numeric"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                />
              )}
              <button style={btn(C.maroon)} onClick={handleEmail}>
                {isSignup ? t("create_account") : t("login_now")}
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#777",
                  margin: 0,
                }}
              >
                {isSignup ? t("already_have_account") : t("new_account")}
                <span
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setErr("");
                  }}
                  style={{
                    color: C.maroon,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {isSignup ? t("login_now") : t("create_account")}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default LoginPage;
