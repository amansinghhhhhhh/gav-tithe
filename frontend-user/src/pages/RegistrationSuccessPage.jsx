import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { Header } from "../components/Header";

export default function RegistrationSuccessPage() {
  const navigate = useNavigate();
  const { t } = useLang();

  const goLogin = () => navigate("/login");

  const stepNum = {
    fontWeight: 800,
    color: "#F97316",
    fontSize: 14,
    flexShrink: 0,
    lineHeight: 1.6,
    textAlign: "left",
  };

  const stepText = {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 1.7,
    textAlign: "left",
    flex: 1,
  };

  return (
    <div>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            maxWidth: 520,
            width: "100%",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              padding: "28px 28px 24px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 0 14px",
                fontSize: 30,
              }}
            >
              ✅
            </div>
            <h1 style={{ margin: 0, color: "#fff", fontWeight: 800, fontSize: 22, textAlign: "left" }}>
              {t("reg_popup_title")}
            </h1>
          </div>

          <div style={{ padding: "24px 28px 28px", textAlign: "left" }}>
            <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, margin: "0 0 18px", textAlign: "left" }}>
              {t("reg_popup_body")}
            </p>

            <p style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", margin: "0 0 12px", textAlign: "left" }}>
              {t("reg_popup_next")}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18, textAlign: "left" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left" }}>
                <span style={stepNum}>1)</span>
                <span style={stepText}>{t("reg_popup_step1")}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left" }}>
                <span style={stepNum}>2)</span>
                <span style={stepText}>{t("reg_popup_step2")}</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left" }}>
                <span style={stepNum}>3)</span>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <span style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.7, textAlign: "left" }}>
                    {t("reg_popup_step3")}
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, paddingLeft: 2, textAlign: "left" }}>
                    {[t("reg_popup_doc1"), t("reg_popup_doc2"), t("reg_popup_doc3"), t("reg_popup_doc4")].map(
                      (doc, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left" }}>
                          <span style={{ color: "#F97316", fontSize: 15, lineHeight: 1.4, flexShrink: 0, textAlign: "left" }}>•</span>
                          <span style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, textAlign: "left", flex: 1 }}>
                            {doc}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff7ed",
                border: "1.5px solid #fb923c",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                color: "#9a3412",
                lineHeight: 1.7,
                marginBottom: 22,
                textAlign: "left",
              }}
            >
              {t("reg_popup_note")}
            </div>

            <button
              onClick={goLogin}
              style={{
                width: "100%",
                padding: "14px 0",
                background: "linear-gradient(135deg, #F97316, #fb923c)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
              }}
            >
              {t("login_signin_link")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
