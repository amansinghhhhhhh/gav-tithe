import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmail, registerEmail } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { app } from "../config/firebase";
import { Header } from "../components/Header";
import { Spinner } from "../components/shared/Spinner";

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

function HeroCard() {
  const { t } = useLang();
  return (
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
        {t("login_title")}
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
  );
}

function AuthorityBox() {
  const { t } = useLang();
  const points = [
    t("login_point1"),
    t("login_point2"),
    t("login_point3"),
    t("login_point4"),
  ];
  return (
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
      {points.map((pt, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: i < points.length - 1 ? 8 : 0,
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
      ))}
    </div>
  );
}

function StepDots({ step }) {
  const { t } = useLang();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
      }}
    >
      {[1, 2].map((n) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: step >= n ? "#F97316" : "#e5e7eb",
              color: step >= n ? "#fff" : "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              transition: "all 0.3s",
            }}
          >
            {n}
          </div>
          {n < 2 && (
            <div
              style={{
                width: 40,
                height: 2,
                background: step >= 2 ? "#F97316" : "#e5e7eb",
                borderRadius: 2,
                transition: "all 0.3s",
              }}
            />
          )}
        </div>
      ))}
      <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 4 }}>
        {t("login_step_label")}
      </span>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLang();
  const auth = getAuth(app);

  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // OTP for registration
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpInput, setRegOtpInput] = useState("");
  const [phoneFirebaseUid, setPhoneFirebaseUid] = useState("");
  const [countdown, setCountdown] = useState(0);

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  // ── Registration OTP helpers (useRef pattern — same as useOtp.js) ──
  const regRecaptchaRef = useRef(null);
  const regConfirmRef = useRef(null);

  function destroyRegRecaptcha() {
    try {
      if (regRecaptchaRef.current) regRecaptchaRef.current.clear();
    } catch (_) {}
    regRecaptchaRef.current = null;
    // ❌ DOM container replace mat karo — grecaptcha purane detached widget
    // se bound rehta hai → consumed token → auth/invalid-app-credential (2nd attempt)
  }

  const resetRegOtp = () => {
    setRegOtpSent(false);
    setRegOtpVerified(false);
    setRegOtpInput("");
    setPhoneFirebaseUid("");
    setCountdown(0);
    regConfirmRef.current = null;
    destroyRegRecaptcha();
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    return () => destroyRegRecaptcha();
  }, []);

  const getRegRecaptcha = () => {
    if (regRecaptchaRef.current) return regRecaptchaRef.current;
    regRecaptchaRef.current = new RecaptchaVerifier(
      auth,
      "reg-recaptcha-container",
      { size: "invisible", callback: () => {}, "expired-callback": () => { destroyRegRecaptcha(); } },
    );
    return regRecaptchaRef.current;
  };

  const sendRegOtp = async () => {
    setErr("");
    if (mobile.length !== 10) { setErr(t("login_error_mobile")); return; }
    setRegOtpLoading(true);
    try {
      const verifier = getRegRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, `+91${mobile}`, verifier);
      regConfirmRef.current = confirmation;
      setRegOtpSent(true);
      setCountdown(59);
    } catch (e) {
      console.error("OTP send error:", e);
      setErr(t(firebaseErrorKey(e.code)));
      destroyRegRecaptcha();
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleVerifyRegOtp = async () => {
    if (regOtpInput.length < 4) return;
    setErr("");
    setRegOtpLoading(true);
    try {
      if (!regConfirmRef.current) throw new Error("Pehle OTP bhejo");
      const result = await regConfirmRef.current.confirm(regOtpInput);
      const uid = result.user.uid;
      setPhoneFirebaseUid(uid);
      setRegOtpVerified(true);
    } catch (e) {
      console.error("OTP verify error:", e);
      setErr(t(firebaseErrorKey(e.code)));
    } finally {
      setRegOtpLoading(false);
    }
  };

  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr(t("login_error"));
      return;
    }
    setLoading(true);
    try {
      const isEmail = email.includes("@");
      // Mobile input clean: remove spaces, dashes, etc.
      const cleanInput = isEmail ? email.trim() : email.replace(/[^0-9]/g, "").slice(-10);

      if (isEmail) {
        // ── Email login: existing Firebase flow ──
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
        // ── Mobile login: skip Firebase, direct backend ──
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

  const handleStep1Next = () => {
    setErr("");
    const val = email.trim();
    if (!val) {
      setErr(t("login_error_email"));
      return;
    }
    if (password.length < 6) {
      setErr(t("login_error_pass"));
      return;
    }
    if (val.includes("@")) {
      // ── Email mode ──
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setErr(t("login_error_email"));
        return;
      }
      setEmail(val);
      setMobile("");
    } else {
      // ── Mobile mode ──
      const digits = val.replace(/\D/g, "");
      if (digits.length !== 10) {
        setErr(t("login_error_mobile"));
        return;
      }
      setMobile(digits);
      setEmail("");
    }
    setStep(2);
  };

  const handleRegister = async () => {
    setErr("");
    if (!firstName.trim()) {
      setErr(t("login_error_firstname"));
      return;
    }
    if (!surname.trim()) {
      setErr(t("login_error_surname"));
      return;
    }
    // Email hamesha required — step 2 me yahin se edit ho sakta hai
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr(t("login_error_email"));
      return;
    }
    if (mobile && mobile.length !== 10) {
      setErr(t("login_error_mobile"));
      return;
    }
    if (mobile && !regOtpVerified) {
      setErr(t("login_error_otp"));
      return;
    }
    setLoading(true);
    try {
      const fbCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await sendEmailVerification(fbCred.user);
      const fullName = [firstName, middleName, surname]
        .filter(Boolean)
        .join(" ");
      const data = await registerEmail(email, password, mobile, fullName, phoneFirebaseUid);
      if (data?.success || data?.token) {
        // ✅ Firebase session reset — agla registration fresh state se chalu ho
        signOut(auth).catch(() => {});
        setSuccessMsg(t("registration_success", { email }));
        setIsSignup(false);
        setStep(1);
        setEmail("");
        setPassword("");
        resetRegOtp();
      } else {
        setErr(data?.message || t("login_error"));
      }
    } catch (e) {
      console.error("Register error:", e);
      setErr(t(firebaseErrorKey(e.code)));
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
          <HeroCard />
          <div style={{ padding: "24px 24px 28px" }}>
            <AuthorityBox />
            {isSignup && <StepDots step={step} />}

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

            {/* ── LOGIN ── */}
            {!isSignup && (
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
                    {/* ✅ Forgot password → navigate */}
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
                    onClick={() => {
                      setIsSignup(true);
                      setStep(1);
                      setErr("");
                      setSuccessMsg("");
                      resetRegOtp();
                    }}
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
            )}

            {/* ── SIGNUP STEP 1 ── */}
            {isSignup && step === 1 && (
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
                  <label style={labelStyle}>
                    {t("login_password")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>{" "}
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                      {t("login_password_hint")}
                    </span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      style={inp}
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  onClick={handleStep1Next}
                  style={{
                    width: "100%",
                    padding: "14px 0",
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
                  {t("login_next")}
                </button>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  {t("login_have_account")}{" "}
                  <span
                    onClick={() => {
                      setIsSignup(false);
                      setErr("");
                      resetRegOtp();
                    }}
                    style={{
                      color: "#F97316",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {t("login_signin_link")}
                  </span>
                </p>
              </div>
            )}

            {/* ── SIGNUP STEP 2 ── */}
            {isSignup && step === 2 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    {
                      label: t("login_firstname"),
                      val: firstName,
                      set: setFirstName,
                      req: true,
                      ph: t("login_firstname_ph"),
                    },
                    {
                      label: t("login_middlename"),
                      val: middleName,
                      set: setMiddleName,
                      req: false,
                      ph: t("login_middlename_ph"),
                    },
                    {
                      label: t("login_surname"),
                      val: surname,
                      set: setSurname,
                      req: true,
                      ph: t("login_surname_ph"),
                    },
                  ].map(({ label: lbl, val, set, req, ph }) => (
                    <div key={lbl}>
                      <label style={labelStyle}>
                        {lbl}{" "}
                        {req && <span style={{ color: "#ef4444" }}>*</span>}
                      </label>
                      <input
                        style={{ ...inp, padding: "11px 10px", fontSize: 13 }}
                        placeholder={ph}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                  ))}
                </div>
                <div id="reg-recaptcha-container" />
                <div>
                  <label style={labelStyle}>{t("login_mobile")}</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <span
                        style={{
                          position: "absolute",
                          left: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#9ca3af",
                          fontSize: 14,
                        }}
                      >
                        📱
                      </span>
                      <input
                        style={{ ...inp, paddingLeft: 38 }}
                        placeholder={t("login_mobile_ph")}
                        value={mobile}
                        maxLength={10}
                        inputMode="numeric"
                        disabled={regOtpSent}
                        onChange={(e) =>
                          setMobile(e.target.value.replace(/\D/g, ""))
                        }
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                    {!regOtpSent && !regOtpVerified && (
                      <button
                        onClick={sendRegOtp}
                        disabled={regOtpLoading || mobile.length !== 10}
                        style={{
                          padding: "10px 16px",
                          background: regOtpLoading ? "#aaa" : "#22c55e",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: regOtpLoading || mobile.length !== 10 ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {regOtpLoading && <Spinner size={16} style={{ filter: "brightness(0) invert(1)" }} />}
                        {regOtpLoading ? "..." : t("s1_get_otp")}
                      </button>
                    )}
                    {regOtpSent && !regOtpVerified && (
                      <button
                        onClick={() => { setRegOtpSent(false); setRegOtpInput(""); destroyRegRecaptcha(); }}
                        style={{
                          padding: "10px 12px",
                          background: "none",
                          border: "1.5px solid #1e3a5f",
                          borderRadius: 10,
                          color: "#1e3a5f",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ✏ {t("s1_edit_number") || "Edit"}
                      </button>
                    )}
                  </div>

                  {/* OTP input */}
                  {regOtpSent && !regOtpVerified && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <input
                        style={{ ...inp, flex: 1 }}
                        placeholder={t("s1_otp_ph") || "OTP enter karo"}
                        value={regOtpInput}
                        onChange={(e) => setRegOtpInput(e.target.value.replace(/\D/g, ""))}
                        maxLength={6}
                        disabled={regOtpLoading}
                      />
                      <button
                        onClick={handleVerifyRegOtp}
                        disabled={regOtpLoading || regOtpInput.length < 4}
                        style={{
                          padding: "10px 16px",
                          background: regOtpLoading ? "#aaa" : "#1e3a5f",
                          color: "#fff",
                          border: "none",
                          borderRadius: 10,
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: regOtpLoading || regOtpInput.length < 4 ? "not-allowed" : "pointer",
                        }}
                      >
                        {t("s1_verify")}
                      </button>
                    </div>
                  )}

                  {/* Resend */}
                  {regOtpSent && !regOtpVerified && (
                    <button
                      onClick={sendRegOtp}
                      disabled={regOtpLoading || countdown > 0}
                      style={{
                        background: "none",
                        border: "none",
                        color: countdown > 0 ? "#9ca3af" : "#22c55e",
                        cursor: countdown > 0 ? "not-allowed" : "pointer",
                        fontSize: 12,
                        marginTop: 4,
                        padding: 0,
                        fontWeight: 600,
                      }}
                    >
                      {countdown > 0
                        ? `${t("s1_resend_wait") || "Resend in"} ${countdown}s`
                        : t("s1_resend_otp") || "Resend OTP"}
                    </button>
                  )}

                  {regOtpVerified && (
                    <div style={{ color: "#22c55e", fontSize: 13, marginTop: 6, fontWeight: 600 }}>
                      ✅ {t("s1_verified") || "Verified"}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("login_email")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={inp}
                    type="email"
                    placeholder={t("login_email_ph")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("login_pass_readonly")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={{ ...inp, background: "#f9fafb", color: "#6b7280" }}
                    type="password"
                    value={password}
                    readOnly
                  />
                </div>
                <button
                  onClick={handleRegister}
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
                  {loading ? t("login_registering") : t("login_register_btn")}
                </button>
                <button
                  onClick={() => {
                    setErr("");
                    setStep(1);
                    if (mobile) setEmail(mobile);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    background: "#fff",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 10,
                    color: "#6b7280",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  ← {t("login_back")}
                </button>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  {t("login_have_account")}{" "}
                  <span
                    onClick={() => {
                      setIsSignup(false);
                      setStep(1);
                      setErr("");
                      resetRegOtp();
                    }}
                    style={{
                      color: "#F97316",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {t("login_signin_link")}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
