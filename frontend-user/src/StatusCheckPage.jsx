import { useState } from "react";
import C from "./constants/colors";
import { checkStatusById } from "./services/api";
import { Header } from "./components/Header";
import { Spinner } from "./components/shared/Spinner";

const STATUS_MAP = {
  draft: { bg: "#f3f4f6", color: "#6b7280", label: "Draft", icon: "📝" },
  submitted: { bg: "#fff7ed", color: "#F97316", label: "Submitted", icon: "📤" },
  under_review: { bg: "#ede9fe", color: "#7c3aed", label: "Under Review", icon: "🔍" },
  approved: { bg: "#dcfce7", color: "#16a34a", label: "Approved", icon: "✅" },
  rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected", icon: "❌" },
  not_started: { bg: "#f3f4f6", color: "#6b7280", label: "Not Started", icon: "⏳" },
};

export default function StatusCheckPage() {
  const [id, setId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Please enter your Application ID");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const res = await checkStatusById(trimmed);
    setLoading(false);

    if (res.success) {
      setResult(res);
    } else {
      setError(res.message || "No application found");
    }
  };

  const statusInfo = result ? STATUS_MAP[result.status] || STATUS_MAP.not_started : null;

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
          padding: "100px 16px 40px",
          fontFamily: "'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            width: "100%",
            maxWidth: 460,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #142952 0%, #1e3a6e 60%, #2d4a7a 100%)",
              borderRadius: "16px 16px 0 0",
              padding: "28px 24px 24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: 22,
              }}
            >
              🔎
            </div>
            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 800,
                fontSize: 20,
              }}
            >
              Check Application Status
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
              }}
            >
              Enter your Application ID to track your form status
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: "24px 24px 28px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                placeholder="MH-ANG-ANG-ANG-001"
                style={{
                  flex: 1,
                  padding: "13px 14px",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                  outline: "none",
                  boxSizing: "border-box",
                  textTransform: "uppercase",
                }}
              />
              <button
                onClick={handleCheck}
                disabled={loading}
                style={{
                  padding: "13px 24px",
                  background: loading
                    ? "#fdba74"
                    : "linear-gradient(135deg, #F97316, #fb923c)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading && <Spinner size={18} style={{ filter: "brightness(0) invert(1)" }} />}
                {loading ? "Checking..." : "Check"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: "#fff0f0",
                  border: "1px solid #fca5a5",
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#dc2626",
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* Result */}
            {result && statusInfo && (
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${statusInfo.color}22`,
                }}
              >
                {/* Status Banner */}
                <div
                  style={{
                    background: statusInfo.bg,
                    padding: "18px 20px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 6 }}>
                    {statusInfo.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.label}
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "16px 20px", background: "#f9fafb" }}>
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Application ID
                    </span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, fontFamily: "monospace", marginTop: 2 }}>
                      {result.uniqueId}
                    </div>
                  </div>

                  {result.submittedAt && (
                    <div style={{ marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Submitted On
                      </span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginTop: 2 }}>
                        {new Date(result.submittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  )}

                  {result.adminRemark && (
                    <div
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        padding: "12px 14px",
                        marginTop: 4,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Admin Remark
                      </span>
                      <div style={{ fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 1.5 }}>
                        {result.adminRemark}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "#9ca3af",
                marginTop: 20,
              }}
            >
              You received this ID after submitting your application form.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
