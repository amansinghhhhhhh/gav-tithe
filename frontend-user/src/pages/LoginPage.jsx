  import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginEmail } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import VoiceGuide from "../components/VoiceGuide";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { Header } from "../components/Header";
import { Spinner } from "../components/shared/Spinner";
import { RegistrationPopup } from "../components/RegistrationPopup";
import FaqModal from "../components/FaqModal";
import InfoTip from "../components/InfoTip";
import faqIcon from "../assets/faq.png";
import videoSrc from "../assets/gtu-register.mp4";

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
  textAlign: "left",
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
  const [loginMode, setLoginMode] = useState("mobile");
  const [successMsg, setSuccessMsg] = useState("");
  const [showRegSuccessPopup, setShowRegSuccessPopup] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const loginFaqs = [
    { qKey: "faq_login_q1", aKey: "faq_login_a1" },
    { qKey: "faq_login_q2", aKey: "faq_login_a2" },
    { qKey: "faq_login_q3", aKey: "faq_login_a3" },
    { qKey: "faq_login_q4", aKey: "faq_login_a4" },
    { qKey: "faq_login_q5", aKey: "faq_login_a5" },
    { qKey: "faq_login_q6", aKey: "faq_login_a6" },
    { qKey: "faq_login_q7", aKey: "faq_login_a7" },
    { qKey: "faq_login_q8", aKey: "faq_login_a8" },
  ];

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  useEffect(() => {
    if (location.state?.regSuccess) {
      setShowRegSuccessPopup(true);
      try {
        sessionStorage.setItem("regSuccessPending", "1");
      } catch (_) {}
      window.history.replaceState({}, document.title);
    } else {
      try {
        if (sessionStorage.getItem("regSuccessPending") === "1") {
          setShowRegSuccessPopup(true);
          sessionStorage.removeItem("regSuccessPending");
        }
      } catch (_) {}
    }
  }, []);

  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr(t("login_error"));
      return;
    }

    if (loginMode === "mobile") {
      const cleanMobile = email.replace(/[^0-9]/g, "").slice(-10);
      if (cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
        setErr(t("login_error_mobile"));
        return;
      }
      setLoading(true);
      try {
        const data = await loginEmail(cleanMobile, password);
        if (data?.success) {
          login(data.user);
          navigate("/dashboard");
        } else if (data?.retryAfterMinutes) {
          setErr(t("err_rate_limit", { min: data.retryAfterMinutes }));
        } else {
          setErr(t("login_error_credential_mobile"));
        }
      } catch (e) {
        setErr(t("login_error_credential_mobile"));
      } finally {
        setLoading(false);
      }
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErr(t("login_error_email"));
        return;
      }
      setLoading(true);
      try {
        let fbCred;
        try {
          fbCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (firebaseErr) {
          setErr(t("login_error_credential"));
          setLoading(false);
          return;
        }
        if (!fbCred.user.emailVerified) {
          setErr(t("login_not_verified"));
          setLoading(false);
          return;
        }
        const firebaseIdToken = await fbCred.user.getIdToken();
        const data = await loginEmail(email.trim(), password, firebaseIdToken);
        if (data?.success) {
          login(data.user);
          navigate("/dashboard");
        } else if (data?.retryAfterMinutes) {
          setErr(t("err_rate_limit", { min: data.retryAfterMinutes }));
        } else {
          setErr(t("login_error_credential"));
        }
      } catch (e) {
        setErr(t("login_error_credential"));
      } finally {
        setLoading(false);
      }
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
            <button
              onClick={() => setShowFaq(true)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 45,
                height: 45,
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <img src={faqIcon} alt="FAQ" style={{ width: 45, height: 45 }} />
            </button>
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
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <VoiceGuide
                  textKey={loginMode === "mobile" ? "voice_login_mobile" : "voice_login_email"}
                  autoPlay={true}
                />
                <span style={{ fontSize: 12, color: "#6b7280" }}>
                  {t("voice_step")} 1
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                {[
                  { value: "mobile", label: t("login_with_mobile") },
                  { value: "email", label: t("login_with_email") },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setLoginMode(opt.value); setEmail(""); setErr(""); }}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      background: loginMode === opt.value ? "#F97316" : "#f3f4f6",
                      color: loginMode === opt.value ? "#fff" : "#6b7280",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div>
                <label style={labelStyle}>
                  {loginMode === "mobile" ? t("login_mobile") : t("login_email")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                  <InfoTip textKey={loginMode === "mobile" ? "info_mobile" : "info_email"} />
                </label>
                <div style={{ position: "relative" }}>
                  {loginMode === "mobile" && (
                    <span
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 15,
                        color: "#6b7280",
                        fontWeight: 600,
                        pointerEvents: "none",
                      }}
                    >
                      +91
                    </span>
                  )}
                  <input
                    style={{
                      ...inp,
                      paddingLeft: loginMode === "mobile" ? 48 : 14,
                    }}
                    type={loginMode === "mobile" ? "tel" : "email"}
                    inputMode={loginMode === "mobile" ? "tel" : "email"}
                    maxLength={loginMode === "mobile" ? 10 : undefined}
                    placeholder={loginMode === "mobile" ? t("login_mobile_ph") : t("login_email_ph")}
                    value={email}
                    onChange={(e) => {
                      if (loginMode === "mobile") {
                        setEmail(e.target.value.replace(/[^0-9]/g, "").slice(0, 10));
                      } else {
                        setEmail(e.target.value);
                      }
                    }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
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
                    <InfoTip textKey="info_password_login" />
                  </label>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
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
                    <InfoTip textKey="info_forgot" size={14} align="right" />
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
              <button
                onClick={() => setShowVideo(true)}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "#f3f4f6",
                  color: "#F97316",
                  border: "1.5px solid #F97316",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                ▶️ {t("watch_video_more_info")}
              </button>
            </div>
          </div>
        </div>
      </div>
      {!showRegSuccessPopup && (
        <RegistrationPopup
          onRegister={() => navigate("/register")}
        />
      )}

      {showRegSuccessPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
            padding: 20,
          }}
          onClick={() => setShowRegSuccessPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 420,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                padding: "24px 24px 20px",
                textAlign: "left",
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
                  margin: "0 0 12px",
                  fontSize: 28,
                }}
              >
                ✅
              </div>
              <h2 style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 19 }}>
                {t("reg_popup_title")}
              </h2>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 16px", textAlign: "left" }}>
                {t("reg_popup_body")}
              </p>

              <p style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", margin: "0 0 10px", textAlign: "left" }}>
                {t("reg_popup_next")}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 800, color: "#F97316", fontSize: 13, flexShrink: 0, lineHeight: 1.6 }}>1)</span>
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{t("reg_popup_step1")}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 800, color: "#F97316", fontSize: 13, flexShrink: 0, lineHeight: 1.6 }}>2)</span>
                  <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{t("reg_popup_step2")}</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 800, color: "#F97316", fontSize: 13, flexShrink: 0, lineHeight: 1.6 }}>3)</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>{t("reg_popup_step3")}</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, paddingLeft: 2 }}>
                      {[t("reg_popup_doc1"), t("reg_popup_doc2"), t("reg_popup_doc3"), t("reg_popup_doc4")].map((doc, i) => (
                        <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                          <span style={{ color: "#F97316", fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>•</span>
                          <span style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.55 }}>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#fff7ed",
                  border: "1.5px solid #fb923c",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#9a3412",
                  lineHeight: 1.65,
                  marginBottom: 16,
                }}
              >
                {t("reg_popup_note")}
              </div>

              <button
                onClick={() => {
                  setShowRegSuccessPopup(false);
                  try {
                    sessionStorage.removeItem("regSuccessPending");
                  } catch (_) {}
                }}
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
      <FaqModal open={showFaq} onClose={() => setShowFaq(false)} faqs={loginFaqs} titleKey="faq_login_title" />

      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#000",
              borderRadius: 16,
              width: "100%",
              maxWidth: 360,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#1a1a1a",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {t("watch_video_title")}
              </span>
              <button
                onClick={() => setShowVideo(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <video
              src={videoSrc}
              controls
              autoPlay
              style={{
                width: "100%",
                aspectRatio: "9/16",
                objectFit: "contain",
                background: "#000",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
