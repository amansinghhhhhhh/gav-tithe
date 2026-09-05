import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerEmail, checkMobile } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useLang } from "../context/LangContext";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
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

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useLang();

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

  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [regOtpLoading, setRegOtpLoading] = useState(false);
  const [regOtpInput, setRegOtpInput] = useState("");
  const [phoneFirebaseUid, setPhoneFirebaseUid] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [step, setStep] = useState(1);

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  const regRecaptchaRef = useRef(null);
  const regConfirmRef = useRef(null);

  function destroyRegRecaptcha() {
    try {
      if (regRecaptchaRef.current) regRecaptchaRef.current.clear();
    } catch (_) {}
    regRecaptchaRef.current = null;
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

  // Step auto-advance: Names filled → step 2
  useEffect(() => {
    if (step === 1 && firstName.trim() && surname.trim()) {
      setStep(2);
    }
  }, [firstName, surname, step]);

  // Step auto-advance: OTP verified → step 3
  useEffect(() => {
    if (step === 2 && regOtpVerified) {
      setStep(3);
    }
  }, [regOtpVerified, step]);

  // Step auto-advance: Valid email → step 4
  useEffect(() => {
    if (step === 3 && email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep(4);
    }
  }, [email, step]);

  // Step auto-advance: Valid password → step 5
  useEffect(() => {
    if (step === 4 && password.length >= 6) {
      setStep(5);
    }
  }, [password, step]);

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
      const mobileCheck = await checkMobile(mobile);
      if (!mobileCheck.success) {
        setErr(t("login_error_mobile_exists"));
        setRegOtpLoading(false);
        return;
      }
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
      if (!regConfirmRef.current) throw new Error("Send OTP first");
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErr(t("login_error_email"));
      return;
    }
    if (password.length < 6) {
      setErr(t("login_error_pass"));
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
        signOut(auth).catch(() => {});
        setSuccessMsg(t("registration_success", { email }));
        setEmail("");
        setPassword("");
        setFirstName("");
        setMiddleName("");
        setSurname("");
        setMobile("");
        resetRegOtp();
        setTimeout(() => navigate("/login", { state: { successMsg: t("registration_success", { email }) } }), 2000);
      } else {
        setErr(t(data?.message) || t("login_error"));
      }
    } catch (e) {
      console.error("Register error:", e);
      setErr(t(firebaseErrorKey(e.code)));
    } finally {
      setLoading(false);
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
          <div style={{ padding: "24px 24px 28px" }}>
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
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                {["1", "2", "3", "4"].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: step > i ? "#F97316" : "#e5e7eb",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>

              {/* Names — always editable */}
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

              {/* Mobile — visible always, disabled until step 2 */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, opacity: step >= 2 ? 1 : 0.5, pointerEvents: step >= 2 ? "auto" : "none" }}>
                <div id="reg-recaptcha-container" />
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
                      style={{ ...inp, paddingLeft: 38, background: step >= 2 ? "#fff" : "#f9fafb" }}
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

                {regOtpSent && !regOtpVerified && (
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <input
                      style={{ ...inp, flex: 1 }}
                      placeholder={t("s1_otp_ph") || "Enter OTP"}
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

              {/* Email — visible always, disabled until step 3 */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, opacity: step >= 3 ? 1 : 0.5, pointerEvents: step >= 3 ? "auto" : "none" }}>
                <label style={labelStyle}>
                  {t("login_email")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={{ ...inp, background: step >= 3 ? "#fff" : "#f9fafb" }}
                  type="email"
                  placeholder={t("login_email_ph")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              {/* Password — visible always, disabled until step 4 */}
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, opacity: step >= 4 ? 1 : 0.5, pointerEvents: step >= 4 ? "auto" : "none" }}>
                <label style={labelStyle}>
                  {t("login_pass_readonly")}{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inp, background: step >= 4 ? "#fff" : "#f9fafb" }}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                  <span
                    onClick={() => step >= 4 && setShowPass(!showPass)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: step >= 4 ? "pointer" : "default",
                      color: "#9ca3af",
                      fontSize: 18,
                    }}
                  >
                    {showPass ? "🙈" : "👁"}
                  </span>
                </div>
              </div>

              {/* Register Button — visible always, disabled until step 5 */}
              <button
                onClick={handleRegister}
                disabled={loading || step < 5}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  background: loading
                    ? "#fdba74"
                    : step >= 5
                    ? "linear-gradient(135deg, #F97316, #fb923c)"
                    : "#d1d5db",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: loading || step < 5 ? "not-allowed" : "pointer",
                  boxShadow: step >= 5 ? "0 4px 14px rgba(249,115,22,0.35)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.3s",
                }}
              >
                {loading && <Spinner size={20} style={{ filter: "brightness(0) invert(1)" }} />}
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
                  onClick={() => navigate("/login")}
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
          </div>
        </div>
      </div>
    </>
  );
}
