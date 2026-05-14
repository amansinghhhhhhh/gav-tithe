import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmail, registerEmail } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../config/firebase";
import { Header } from "../components/Header";

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

// ── Hero Card ─────────────────────────────────────────────────────────────────
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

// ── Authority Box ─────────────────────────────────────────────────────────────
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

// ── Step Dots ─────────────────────────────────────────────────────────────────
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

// ── Main LoginPage ─────────────────────────────────────────────────────────────
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

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr(t("login_error"));
      return;
    }
    setLoading(true);
    try {
      let fbCred;
      try {
        fbCred = await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseErr) {
        setErr(
          firebaseErr.code === "auth/invalid-credential" ||
            firebaseErr.code === "auth/user-not-found"
            ? t("login_error1")
            : firebaseErr.message,
        );
        setLoading(false);
        return;
      }
      if (!fbCred.user.emailVerified) {
        setErr(t("login_not_verified"));
        setLoading(false);
        return;
      }
      const data = await loginEmail(email, password);
      if (data?.success) {
        login(data.user);
        navigate("/dashboard");
      } else setErr(data?.message || t("login_error1"));
    } catch (e) {
      setErr(t("login_failed", { msg: e.message }));
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP Step 1 ──────────────────────────────────────────────────────────
  const handleStep1Next = () => {
    setErr("");
    if (!email) {
      setErr(t("login_error_email"));
      return;
    }
    if (password.length < 6) {
      setErr(t("login_error_pass"));
      return;
    }
    setStep(2);
  };

  // ── SIGNUP Step 2 ──────────────────────────────────────────────────────────
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
    if (mobile && mobile.length !== 10) {
      setErr(t("login_error_mobile"));
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
      const data = await registerEmail(email, password, mobile, fullName);
      if (data?.success || data?.token) {
        setSuccessMsg(t("registration_success", { email }));
        setIsSignup(false);
        setStep(1);
        setEmail("");
        setPassword("");
      } else {
        setErr(data?.message || t("login_error"));
      }
    } catch (e) {
      setErr(
        e.code === "auth/email-already-in-use" ? t("login_error2") : e.message,
      );
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

            {/* Success */}
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

            {/* Error */}
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
                  }}
                >
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
                <div>
                  <label style={labelStyle}>{t("login_mobile")}</label>
                  <div style={{ position: "relative" }}>
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
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, ""))
                      }
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("login_email_readonly")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={{ ...inp, background: "#f9fafb", color: "#6b7280" }}
                    value={email}
                    readOnly
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
                  }}
                >
                  {loading ? t("login_registering") : t("login_register_btn")}
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
