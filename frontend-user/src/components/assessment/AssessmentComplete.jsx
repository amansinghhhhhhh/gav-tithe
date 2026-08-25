import C from "../../constants/colors";
import { useLang } from "../../context/LangContext";

export default function AssessmentComplete({ completedAt, onRetake, saving, onBackToJourney, score }) {
  const { lang } = useLang();

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 4px 30px rgba(0,0,0,0.12)",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {/* Success Banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.green} 0%, #15803d 100%)`,
            padding: "40px 28px",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: 50,
              color: "#fff",
            }}
          >
            🎉
          </div>
          <h2
            style={{
              color: "#fff",
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            {lang === "mr"
              ? "मूल्यांकन पूर्ण झाले!"
              : "Assessment Complete!"}
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              margin: "8px 0 0",
              fontSize: 15,
            }}
          >
            {lang === "mr"
              ? "तुम्ही उद्योजक मनोवृत्ती निर्मिती मूल्यांकन पूर्ण केले आहे"
              : "You have completed the Entrepreneurial Mindset Creation Assessment"}
          </p>
        </div>

        {/* Badge Section */}
        <div style={{ padding: "32px 28px" }}>
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.orange} 0%, #fbbf24 100%)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 30px rgba(249,115,22,0.35)",
            }}
          >
            <span style={{ fontSize: 40 }}>🏆</span>
            <span
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {lang === "mr" ? "पूर्ण झाले" : "COMPLETED"}
            </span>
          </div>

          {formattedDate && (
            <p
              style={{
                fontSize: 13,
                color: C.textopa,
                margin: "0 0 24px",
              }}
            >
              {lang === "mr" ? "पूर्ण केल्याची तारीख" : "Completed on"}:{" "}
              <span style={{ fontWeight: 700, color: C.navy }}>
                {formattedDate}
              </span>
            </p>
          )}

          {typeof score === "number" && (
            <div
              style={{
                background: "#fff7ed",
                border: "2px solid #fdba74",
                borderRadius: 12,
                padding: "14px 20px",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: "#9a3412" }}>
                {lang === "mr" ? "तुमचे स्कोअर" : "Your Score"}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 800, color: C.orange }}>
                {score} / 15
              </p>
            </div>
          )}

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#166534",
                lineHeight: 1.6,
              }}
            >
              {lang === "mr"
                ? "तुमचे मूल्यांकन यशस्वीपणे पूर्ण झाले आहे. तुम्ही तुमच्या उद्योजक तयारीबद्दल महत्त्वाचे माहिती प्राप्त केली आहे."
                : "Your assessment has been successfully completed. You've gained valuable insights into your entrepreneurial readiness."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {onBackToJourney && (
              <button
                onClick={onBackToJourney}
                style={{
                  padding: "13px 32px",
                  background: C.navy,
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {lang === "mr" ? "➡ माझा प्रवास" : "➡ Back to My Journey"}
              </button>
            )}
            <button
              onClick={onRetake}
              disabled={saving}
              style={{
                padding: "13px 32px",
                background: "#fff",
                color: C.navy,
                border: `2px solid ${C.navy}`,
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 14,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {saving
                ? "Saving..."
                : lang === "mr"
                ? "🔄 पुन्हा प्रयत्न करा"
                : "🔄 Retake Assessment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
