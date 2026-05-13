import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { applyActionCode, getAuth } from "firebase/auth";
import { app } from "../config/firebase";
import { markEmailVerified } from "../services/api";
import C from "../constants/colors";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth(app);

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");
    const mode = searchParams.get("mode");

    if (mode !== "verifyEmail" || !oobCode) {
      setStatus("error");
      setMsg("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        // Step 1 — Firebase verify karo
        await applyActionCode(auth, oobCode);

        // Step 2 — Backend mein isVerified: true karo
        await markEmailVerified();

        setStatus("success");

        // Step 3 — 3 seconds baad login page pe redirect
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (e) {
        console.error(e);
        if (e.code === "auth/invalid-action-code") {
          setMsg("Link is Expired");
        } else {
          setMsg(e.message);
        }
        setStatus("error");
      }
    };

    verify();
  }, []);

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
              Verifying...
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14 }}>Thoda wait karo</p>
          </>
        )}

        {/* Success */}
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
              Email Verified! 🎉
            </h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 20px" }}>
              Email Verified.. Please Login!!
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
              Please Wait for 3 Sec. Automatically Redirect..
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
              → Login
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
              Verification Failed
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
              ← Go to login Page
            </button>
          </>
        )}
      </div>
    </div>
  );
}
