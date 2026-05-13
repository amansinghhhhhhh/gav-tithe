import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginEmail, registerEmail } from "../services/api";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";

import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { app } from "../config/firebase";

// ── Styles ────────────────────────────────────────────────────────────────────
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

const label = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
  display: "block",
};

// ── Hero Card (top orange section) ───────────────────────────────────────────
function HeroCard() {
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
      {/* Decorative circles */}
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

      {/* Bulb icon */}
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
        Potential Entrepreneur
      </h2>
      <p
        style={{
          margin: "6px 0 0",
          color: "rgba(255,255,255,0.85)",
          fontSize: 13,
        }}
      >
        Start Your Business Journey
      </p>
    </div>
  );
}

// ── Authority Box ─────────────────────────────────────────────────────────────
function AuthorityBox() {
  const points = [
    "Free registration & mindset assessment",
    "Business training & skill development",
    "Government scheme access & DPR library",
    "Personal mentorship & milestone tracking",
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
        Authority &amp; Responsibilities
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
        Basic Details
      </span>
    </div>
  );
}

// ── Main LoginPage ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const auth = getAuth(app);

  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1); // 1 = login/step1, 2 = basic details

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Signup Step 2 fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr("Email aur password daalo");
      return;
    }
    setLoading(true);
    try {
      // Step 1 — Firebase sign in
      let fbCred;
      try {
        fbCred = await signInWithEmailAndPassword(auth, email, password);
      } catch (firebaseErr) {
        if (
          firebaseErr.code === "auth/invalid-credential" ||
          firebaseErr.code === "auth/user-not-found"
        ) {
          setErr("Email ya password galat hai");
        } else {
          setErr(firebaseErr.message);
        }
        setLoading(false);
        return;
      }

      // Step 2 — Email verified check
      if (!fbCred.user.emailVerified) {
        setErr(
          "Email verify nahi hai. Inbox check karo aur verify link pe click karo.",
        );
        setLoading(false);
        return;
      }

      // Step 3 — Backend login
      const data = await loginEmail(email, password);
      if (data?.success) {
        login(data.user);
        navigate("/dashboard");
      } else {
        setErr(data?.message || "Login failed");
      }
    } catch (e) {
      setErr("Login failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP Step 1 → Step 2 ─────────────────────────────────────────────────
  const handleStep1Next = () => {
    setErr("");
    if (!email) {
      setErr("Email daalo");
      return;
    }
    if (password.length < 6) {
      setErr("Password kam se kam 6 characters hona chahiye");
      return;
    }
    setStep(2);
  };

  // ── SIGNUP Step 2 → Register ───────────────────────────────────────────────
  const handleRegister = async () => {
    setErr("");
    if (!firstName.trim()) {
      setErr("First Name daalo");
      return;
    }
    if (!surname.trim()) {
      setErr("Surname daalo");
      return;
    }
    if (mobile && mobile.length !== 10) {
      setErr("Valid 10-digit mobile daalo");
      return;
    }

    setLoading(true);
    try {
      // 1. Firebase user create
      const fbCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. Verification email bhejo
      await sendEmailVerification(fbCred.user);

      // 3. MongoDB mein save karo
      const fullName = [firstName, middleName, surname]
        .filter(Boolean)
        .join(" ");
      const data = await registerEmail(email, password, mobile, fullName);

      if (data?.success || data?.token) {
        setSuccessMsg(
          `✅ Registration successful! "${email}" pe verification link bheja gaya hai. Email verify karo phir login karo.`,
        );
        setIsSignup(false);
        setStep(1);
        setEmail("");
        setPassword("");
      } else {
        setErr(data?.message || "Registration failed");
      }
    } catch (e) {
      const msg =
        e.code === "auth/email-already-in-use"
          ? "Yeh email already registered hai — login karo"
          : e.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification email ──────────────────────────────────────────────
  const handleResendVerification = async () => {
    setErr("");
    try {
      const fbCred = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(fbCred.user);
      setSuccessMsg("Verification email dobara bheja gaya! Inbox check karo.");
    } catch {
      setErr("Pehle login karo — phir resend hoga");
    }
  };

  return (
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
        {/* Orange Hero */}
        <HeroCard />

        {/* Form Body */}
        <div style={{ padding: "24px 24px 28px" }}>
          {/* Authority Box */}
          <AuthorityBox />

          {/* Step Dots — signup step 2 pe dikhao */}
          {isSignup && <StepDots step={step} />}

          {/* Success Message */}
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
              {err.includes("verify nahi") && (
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
                  → Verification email dobara bhejo
                </span>
              )}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {!isSignup && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={label}>
                  Email Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={inp}
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                  <label style={{ ...label, margin: 0 }}>
                    Password <span style={{ color: "#ef4444" }}>*</span>{" "}
                    <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                      (min 6 chars)
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
                    Forgot password?
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
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                {loading ? "Signing in..." : "→ Sign in"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                New here?{" "}
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
                  Register for free →
                </span>
              </p>
            </div>
          )}

          {/* ── SIGNUP STEP 1 — Email + Password ── */}
          {isSignup && step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={label}>
                  Email Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={inp}
                  type="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                  onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                />
              </div>
              <div>
                <label style={label}>
                  Password <span style={{ color: "#ef4444" }}>*</span>{" "}
                  <span style={{ color: "#9ca3af", fontWeight: 400 }}>
                    (min 6 chars)
                  </span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    style={inp}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
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
                Next →
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Already have an account?{" "}
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
                  Sign In →
                </span>
              </p>
            </div>
          )}

          {/* ── SIGNUP STEP 2 — Basic Details ── */}
          {isSignup && step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <div>
                  <label style={label}>
                    First Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={{ ...inp, padding: "11px 10px", fontSize: 13 }}
                    placeholder="Rajesh"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label style={label}>Middle Name</label>
                  <input
                    style={{ ...inp, padding: "11px 10px", fontSize: 13 }}
                    placeholder="Suresh"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
                <div>
                  <label style={label}>
                    Surname <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    style={{ ...inp, padding: "11px 10px", fontSize: 13 }}
                    placeholder="Patil"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label style={label}>Mobile Number</label>
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
                    placeholder="9XXXXXXXXX"
                    value={mobile}
                    maxLength={10}
                    inputMode="numeric"
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                  />
                </div>
              </div>

              {/* Email (readonly) */}
              <div>
                <label style={label}>
                  Email Address <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  style={{ ...inp, background: "#f9fafb", color: "#6b7280" }}
                  value={email}
                  readOnly
                />
              </div>

              {/* Password (readonly) */}
              <div>
                <label style={label}>
                  Password <span style={{ color: "#ef4444" }}>*</span>
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                {loading ? "Registering..." : "✨ Register for Free"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                Already have an account?{" "}
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
                  Sign In →
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
