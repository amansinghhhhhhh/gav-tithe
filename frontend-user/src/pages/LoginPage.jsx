  import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginEmail } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { Header } from "../components/Header";
import { Spinner } from "../components/shared/Spinner";
import { RegistrationPopup } from "../components/RegistrationPopup";

const inp = {
  width: "100%",
  padding: "13px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  color: "#1a1a1a",
  background: "#fff",
  transition: "border-color 0.2s",
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
  display: "block",
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t } = useLang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showRegSuccessPopup, setShowRegSuccessPopup] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  useEffect(() => {
    if (location.state?.successMsg) {
      setRegSuccessMsg(location.state.successMsg);
      setShowRegSuccessPopup(true);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr(t("login_error"));
      return;
    }
    setLoading(true);
    try {
      const isEmail = email.includes("@");
      const cleanInput = isEmail ? email.trim() : email.replace(/[^0-9]/g, "").slice(-10);

      if (isEmail) {
        let fbCred;
        try {
          fbCred = await signInWithEmailAndPassword(auth, email, password);
        } catch (firebaseErr) {
          setErr(t(firebaseErrorKey(firebaseErr.code)));
          setLoading(false);
          return;
        }
        if (!fbCred.user.emailVerified) {
          setErr(t("login_not_verified"));
          setLoading(false);
          return;
        }

        const firebaseIdToken = await fbCred.user.getIdToken();
        const data = await loginEmail(cleanInput, password, firebaseIdToken);
        if (data?.success) {
          login(data.user);
          navigate("/dashboard");
        } else if (data?.retryAfterMinutes) {
          setErr(t("err_rate_limit", { min: data.retryAfterMinutes }));
        } else {
          setErr(data?.message || t("login_error1"));
        }
      } else {
        const data = await loginEmail(cleanInput, password);
        if (data?.success) {
          login(data.user);
          navigate("/dashboard");
        } else if (data?.retryAfterMinutes) {
          setErr(t("err_rate_limit", { min: data.retryAfterMinutes }));
        } else {
          setErr(data?.message || t("login_error1"));
        }
      }
    } catch (e) {
      console.error("Login error:", e);
      setErr(t("fb_generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setErr("");
    try {
      const fbCred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(fbCred.user);
      setSuccessMsg(t("login_resend_success"));
    } catch {
      setErr(t("login_error1"));
    }
  };

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 16px",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(135deg, #F97316 0%, #fb923c 60%, #fbbf24 100%)",
              borderRadius: "16px 16px 0 0",
              padding: "28px 24px 24px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -30,
                left: -10,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: 22,
              }}
            >
              💡
            </div>
            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: "-0.3px",
              }}
            >
              {t("login_title_login")}
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
              }}
            >
              {t("login_subtitle")}
            </p>
          </div>
          <div style={{ padding: "24px 24px 28px" }}>
            <div
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {t("login_authority_head")}
              </p>
              {[t("login_point1"), t("login_point2"), t("login_point3"), t("login_point4")].map(
                (pt, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: i < 3 ? 8 : 0,
                    }}
                  >
                    <span
                      style={{
                        color: "#F97316",
                        fontSize: 15,
                        lineHeight: "20px",
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: 13, color: "#4b5563", lineHeight: "20px" }}>
                      {pt}
                    </span>
                  </div>
                )
              )}
            </div>

            {successMsg && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#166534",
                  fontSize: 13,
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                {successMsg}
              </div>
            )}

            {err && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                ⚠ {err}
                {err === t("login_not_verified") && (
                  <span
                    onClick={handleResendVerification}
                    style={{
                      display: "block",
                      marginTop: 6,
                      color: "#F97316",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {t("login_resend")}
                  </span>
                )}
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label style={labelStyle}>
                  {t("login_email_or_mobile")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={inp}
                  type="text"
                  inputMode="email"
                  placeholder={t("login_email_or_mobile_ph")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <label style={{ ...labelStyle, margin: 0 }}>
                    {t("login_password")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>{" "}
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                      {t("login_password_hint")}
                    </span>
                  </label>
                  <span
                    onClick={() => navigate("/forgot-password")}
                    style={{
                      fontSize: 12,
                      color: "#F97316",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {t("login_forgot")}
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    style={inp}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <span
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                      color: "#9ca3af",
                      fontSize: 18,
                    }}
                  >
                    {showPass ? "🙈" : "👁"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: loading
                    ? "#fdba74"
                    : "linear-gradient(135deg, #F97316, #fb923c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {loading && <Spinner size={20} style={{ filter: "brightness(0) invert(1)" }} />}
                {loading ? t("login_signing") : t("login_btn")}
              </button>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                {t("login_new")}{" "}
                <span
                  onClick={() => navigate("/register")}
                  style={{
                    color: "#F97316",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {t("login_register_link")}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <RegistrationPopup
        onRegister={() => navigate("/register")}
      />

      {showRegSuccessPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowRegSuccessPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 400,
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                padding: "28px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: 28,
                }}
              >
                ✅
              </div>
              <h2 style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 19 }}>
                {t("registration_success_title") || "Registration Successful!"}
              </h2>
            </div>
            <div style={{ padding: "24px" }}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 20px", textAlign: "center" }}>
                {regSuccessMsg}
              </p>
              <button
                onClick={() => setShowRegSuccessPopup(false)}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: "linear-gradient(135deg, #F97316, #fb923c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                {t("ok") || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
