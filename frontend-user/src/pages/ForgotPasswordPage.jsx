import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../config/firebase";
import { useLang } from "../context/LangContext";
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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const auth = getAuth(app);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [err, setErr] = useState("");

  const focusStyle = (e) => (e.target.style.borderColor = "#F97316");
  const blurStyle = (e) => (e.target.style.borderColor = "#e5e7eb");

  const handleReset = async () => {
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
      setErr(t("forgot_error_failed", { msg: e.message }));
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
                <div style={{ marginTop: 6, color: "#4b7c5a", fontSize: 12 }}>
                  {t("forgot_check_spam")}
                </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>

              <button
                onClick={handleReset}
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
                {loading ? t("forgot_sending") : t("forgot_btn")}
              </button>

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
                }}
              >
                {t("forgot_back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
