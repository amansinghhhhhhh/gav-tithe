import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/api";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErr("");
    if (!email || !password) {
      setErr("Email aur password daalo");
      return;
    }
    setLoading(true);
    const data = await loginAdmin(email, password);
    setLoading(false);
    if (data?.success && data?.user?.role === "admin") {
      login(data.user);
      navigate("/dashboard");
    } else if (data?.user?.role !== "admin") {
      setErr("Admin access nahi hai");
    } else {
      setErr(data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.light,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 16,
          padding: "40px 36px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: C.maroon,
              borderRadius: 12,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 14,
              color: "#fff",
              marginBottom: 10,
            }}
          >
            गाव
          </div>
          <h2
            style={{
              margin: 0,
              color: C.maroon,
              fontWeight: 800,
              fontSize: 20,
            }}
          >
            Admin Dashboard
          </h2>
          <p style={{ margin: "4px 0 0", color: C.textopa, fontSize: 13 }}>
            Gaon Tithe Udyojak
          </p>
        </div>

        {err && (
          <div
            style={{
              background: "#fff0f0",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "10px 14px",
              color: C.red,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            ⚠ {err}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            style={inp}
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={inp}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button
            style={{
              padding: "12px 0",
              background: C.maroon,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Login ho raha hai..." : "Login Karo"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inp = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
