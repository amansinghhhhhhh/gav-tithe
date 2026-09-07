import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { app } from "../config/firebase";
import { checkMobile, resetPasswordMobile } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useLang } from "../context/LangContext";
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

const radioGroupStyle = {
  display: "flex",
  gap: 12,
  marginBottom: 8,
};

const radioLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 14,
  fontWeight: 500,
  color: "#374151",
  cursor: "pointer",
  padding: "8px 14px",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  flex: 1,
  textAlign: "center",
  transition: "all 0.2s",
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const auth = getAuth(app);

  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState(1); // 1=input, 2=otp sent, 3=otp verified, 4=reset password
  const [showPass, setShowPass] = useState(false);
  const [idToken, setIdToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [err, setErr] = useState("");

  const confirmRef = useRef(null);
  const recaptchaRef = useRef(null);

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  const getRecaptcha = () => {
    if (recaptchaRef.current) return recaptchaRef.current;
    recaptchaRef.current = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setErr(t("fb_captcha"));
          recaptchaRef.current = null;
        },
      }
    );
    return recaptchaRef.current;
  };

  const handleSendResetLink = async () => {
    setErr("");
    setSuccessMsg("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErr(t("forgot_error_email"));
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg(t("forgot_success", { email }));
      setEmail("");
    } catch (e) {
      console.error("Reset error:", e);
      setErr(t(firebaseErrorKey(e.code)));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMobileOtp = async () => {
    setErr("");
    setSuccessMsg("");
    if (!mobile || mobile.replace(/\D/g, "").length !== 10) {
      setErr(t("forgot_error_mobile"));
      return;
    }
    setLoading(true);
    try {
      const mobileCheck = await checkMobile(`+91${mobile.replace(/\D/g, "").slice(-10)}`);
      // check-mobile returns 400 if mobile is already registered (good — user exists)
      // It returns 200 if mobile is available (user doesn't exist)
      if (mobileCheck.success) {
        setErr(t("forgot_error_mobile_not_registered"));
        setLoading(false);
        return;
      }
      // Mobile exists — send OTP
      const verifier = getRecaptcha();
      const phoneNumber = `+91${mobile.replace(/\D/g, "").slice(-10)}`;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      confirmRef.current = confirmation;
      setStep(2);
    } catch (e) {
      console.error("Mobile OTP send error:", e);
      setErr(t(firebaseErrorKey(e.code)));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    setErr("");
    if (!otp || otp.length !== 6) {
      setErr(t("forgot_error_otp"));
      return;
    }
    setLoading(true);
    try {
      const result = await confirmRef.current.confirm(otp);
      const idToken = await result.user.getIdToken();
      // Store idToken for password reset
      setIdToken(idToken);
      setStep(3);
    } catch (e) {
      console.error("Mobile OTP verify error:", e);
      setErr(t(firebaseErrorKey(e.code)));
    } finally {
      setLoading(false);
    }
  };

  const handleResetMobilePassword = async () => {
    setErr("");
    setSuccessMsg("");
    if (!newPassword || newPassword.length < 6) {
      setErr(t("forgot_error_password_short"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr(t("forgot_error_password_match"));
      return;
    }
      setLoading(true);
      try {
        const data = await resetPasswordMobile(idToken, newPassword);
      if (!data.success) {
        const msg = data.message === "Same password" ? t("forgot_error_same_password") : data.message;
        setErr(msg);
        setLoading(false);
        return;
      }
      setSuccessMsg(t("forgot_password_reset"));
      setNewPassword("");
      setConfirmPassword("");
      setStep(4);
    } catch (e) {
      console.error("Reset password error:", e);
      setErr(t("forgot_error_reset_failed"));
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
          {/* Hero */}
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
              🔑
            </div>
            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              {t("forgot_title")}
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
              }}
            >
              {t("forgot_subtitle")}
            </p>
          </div>

          {/* Form */}
          <div style={{ padding: "28px 24px 32px" }}>
            {/* Success */}
            {successMsg && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  borderRadius: 10,
                  padding: "14px 16px",
                  color: "#166534",
                  fontSize: 13,
                  marginBottom: 20,
                  lineHeight: 1.7,
                }}
              >
                {successMsg}
                {method === "email" && (
                  <div style={{ marginTop: 6, color: "#4b7c5a", fontSize: 12 }}>
                    {t("forgot_check_spam")}
                  </div>
                )}
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
              </div>
            )}

            {/* Method Selection — Only show if step 1 and no success */}
            {step === 1 && !successMsg && (
              <>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ ...labelStyle, marginBottom: 10 }}>
                    {t("forgot_method_label")}
                  </label>
                  <div style={radioGroupStyle}>
                    <label
                      style={{
                        ...radioLabelStyle,
                        borderColor: method === "email" ? "#F97316" : "#e5e7eb",
                        background: method === "email" ? "#fff7ed" : "#fff",
                        color: method === "email" ? "#F97316" : "#374151",
                      }}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="email"
                        checked={method === "email"}
                        onChange={() => { setMethod("email"); setErr(""); setSuccessMsg(""); }}
                        style={{ accentColor: "#F97316" }}
                      />
                      {t("forgot_method_email")}
                    </label>
                    <label
                      style={{
                        ...radioLabelStyle,
                        borderColor: method === "mobile" ? "#F97316" : "#e5e7eb",
                        background: method === "mobile" ? "#fff7ed" : "#fff",
                        color: method === "mobile" ? "#F97316" : "#374151",
                      }}
                    >
                      <input
                        type="radio"
                        name="method"
                        value="mobile"
                        checked={method === "mobile"}
                        onChange={() => { setMethod("mobile"); setErr(""); setSuccessMsg(""); }}
                        style={{ accentColor: "#F97316" }}
                      />
                      {t("forgot_method_mobile")}
                    </label>
                  </div>
                </div>

                {method === "email" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>
                        {t("forgot_email")}{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={inp}
                        type="email"
                        placeholder={t("forgot_email_ph")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendResetLink()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                    <button
                      onClick={handleSendResetLink}
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
                      {loading ? <Spinner size={20} /> : t("forgot_btn")}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                      <label style={labelStyle}>
                        {t("forgot_mobile")}{" "}
                        <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <input
                        style={inp}
                        type="tel"
                        placeholder={t("forgot_mobile_ph")}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMobileOtp()}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                    <button
                      onClick={handleSendMobileOtp}
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
                      {loading ? <Spinner size={20} /> : t("forgot_send_otp")}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && !successMsg && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                    {t("forgot_otp_sent_to")} {mobile}
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("forgot_otp_label")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={{ ...inp, textAlign: "center", fontSize: 20, letterSpacing: 8 }}
                    type="tel"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyMobileOtp()}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <button
                  onClick={handleVerifyMobileOtp}
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
                  {loading ? <Spinner size={20} /> : t("forgot_verify_otp")}
                </button>
                <button
                  onClick={() => { setStep(1); setOtp(""); setErr(""); }}
                  style={{
                    width: "100%",
                    padding: "12px 0",
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  {t("forgot_back")}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && !successMsg && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                    {t("forgot_otp_verified_enter_password")}
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("forgot_new_password")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={inp}
                    type={showPass ? "text" : "password"}
                    placeholder={t("forgot_new_password_ph")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    {t("forgot_confirm_password")}{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={inp}
                    type={showPass ? "text" : "password"}
                    placeholder={t("forgot_confirm_password_ph")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleResetMobilePassword()}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
                <button
                  onClick={handleResetMobilePassword}
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
                  {loading ? <Spinner size={20} /> : t("forgot_reset_btn")}
                </button>
              </div>
            )}

            {/* Step 4: Success — redirect buttons */}
            {step === 4 && successMsg && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                <button
                  onClick={() => navigate("/login")}
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
                  {t("forgot_go_login")}
                </button>
              </div>
            )}

            {/* Back to Login — always visible except step 4 */}
            {step !== 4 && (
              <button
                onClick={() => navigate("/login")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 12,
                }}
              >
                {t("forgot_back")}
              </button>
            )}
          </div>
        </div>
      </div>
      <div id="recaptcha-container" />
    </>
  );
}
