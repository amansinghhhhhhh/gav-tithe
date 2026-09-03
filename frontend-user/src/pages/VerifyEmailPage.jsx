import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
  getAuth,
} from "firebase/auth";
import { app } from "../config/firebase";
import { checkSamePassword } from "../services/api";
import { firebaseErrorKey } from "../services/firebaseErrors";
import { useLang } from "../context/LangContext";
import C from "../constants/colors";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth(app);
  const { t } = useLang();

  const [status, setStatus] = useState("verifying");
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("");

  // Reset password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const oobCode = searchParams.get("oobCode");
  const pageMode = searchParams.get("mode");

  useEffect(() => {
    setMode(pageMode);

    if (!oobCode || !pageMode) {
      setStatus("error");
      setMsg(t("verify_invalid_link"));
      return;
    }

    if (pageMode === "verifyEmail") {
      // Email verification
      const verify = async () => {
        try {
          await applyActionCode(auth, oobCode);
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        } catch (e) {
          setMsg(t(firebaseErrorKey(e.code)));
          setStatus("error");
        }
      };
      verify();
    } else if (pageMode === "resetPassword") {
      // Password reset — verify code first
      const checkCode = async () => {
        try {
          const email = await verifyPasswordResetCode(auth, oobCode);
          setResetEmail(email);
          setStatus("reset_form"); // show password form
        } catch (e) {
          setMsg(t(firebaseErrorKey(e.code)));
          setStatus("error");
        }
      };
      checkCode();
    } else {
      setStatus("error");
      setMsg(t("verify_invalid_link"));
    }
  }, []);

  // Handle new password submit
  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setMsg(t("reset_pass_min"));
      return;
    }
    if (newPassword !== confirmPass) {
      setMsg(t("reset_pass_mismatch"));
      return;
    }
    setMsg("");
    setResetLoading(true);
    try {
      if (resetEmail) {
        console.log("Checking same password for:", resetEmail);
        const sameCheck = await checkSamePassword(resetEmail, newPassword);
        console.log("Same check result:", sameCheck);
        if (!sameCheck.success) {
          setMsg(sameCheck.message || t("reset_same_password"));
          setResetLoading(false);
          return;
        }
      }
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("reset_success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (e) {
      setMsg(t(firebaseErrorKey(e.code)));
    } finally {
      setResetLoading(false);
    }
  };

  const inp = {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${msg ? "#fca5a5" : "#e5e7eb"}`,
    borderRadius: 10,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 32px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Verifying */}
        {status === "verifying" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ color: C.navy, fontWeight: 800, margin: "0 0 8px" }}>
              {t("verify_verifying")}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>{t("verify_wait")}</p>
          </>
        )}

        {/* Email Verify Success */}
        {status === "success" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#dcfce7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
              }}
            >
              ✅
            </div>
            <h2
              style={{ color: "#166534", fontWeight: 800, margin: "0 0 8px" }}
            >
              {t("verify_success_title")}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
              {t("verify_success_msg")}
            </p>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 10,
                padding: "10px 16px",
                color: "#166534",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {t("verify_redirect")}
            </div>
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
              }}
            >
              {t("verify_login_btn")}
            </button>
          </>
        )}

        {/* Reset Password Form */}
        {status === "reset_form" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#fef3c7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
              }}
            >
              🔑
            </div>
            <h2 style={{ color: C.maroon, fontWeight: 800, margin: "0 0 4px" }}>
              Set New Password
            </h2>
            {resetEmail && (
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 20px" }}>
                {resetEmail}
              </p>
            )}

            {msg && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                  marginBottom: 16,
                  textAlign: "left",
                }}
              >
                ⚠ {msg}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                textAlign: "left",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Reset New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={inp}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setMsg("");
                    }}
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
              <div>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                    display: "block",
                  }}
                >
                  Confirm Password
                </label>
                <input
                  style={inp}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={(e) => {
                    setConfirmPass(e.target.value);
                    setMsg("");
                  }}
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={resetLoading}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  background: resetLoading
                    ? "#fdba74"
                    : "linear-gradient(135deg, #F97316, #fb923c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: resetLoading ? "not-allowed" : "pointer",
                  marginTop: 4,
                }}
              >
                {resetLoading ? "Saving..." : "Change Password"}
              </button>
            </div>
          </>
        )}

        {/* Reset Success */}
        {status === "reset_success" && (
          <>
            <div
              style={{
                width: 72,
                height: 72,
                background: "#dcfce7",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 36,
              }}
            >
              ✅
            </div>
            <h2
              style={{ color: "#166534", fontWeight: 800, margin: "0 0 8px" }}
            >
              "Password Changed! 🎉"
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
              "Your password has been successfully changed."
            </p>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 10,
                padding: "10px 16px",
                color: "#166534",
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {t("verify_redirect")}
            </div>
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
              }}
            >
              {t("verify_login_btn")}
            </button>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2
              style={{ color: "#dc2626", fontWeight: 800, margin: "0 0 8px" }}
            >
              {t("verify_error_title")}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
              {msg}
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "13px 0",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              {t("verify_go_login")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
