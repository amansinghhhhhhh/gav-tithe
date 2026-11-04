import { useEffect } from "react";
import confetti from "canvas-confetti";
import C from "../../constants/colors";
import { useLang } from "../../context/LangContext";
import { PartyPopper, Trophy, RotateCcw, Target, Compass, Route } from "lucide-react";

const STAGE_LABELS = {
  explorer: { en: "Explorer", mr: "शोधक" },
  idea: { en: "Idea stage", mr: "कल्पना टप्पा" },
  starter: { en: "Starter", mr: "सुरुवातीचा" },
  running: { en: "Running", mr: "चालू" },
  scaling: { en: "Scaling", mr: "वाढवणारा" },
};

const STYLE_LABELS = {
  learner: { en: "Learner", mr: "शिकणारा" },
  planner: { en: "Planner", mr: "नियोजक" },
  networker: { en: "Networker", mr: "नेटवर्कर" },
  experimenter: { en: "Experimenter", mr: "प्रयोगशील" },
  balanced: { en: "Balanced", mr: "संतुलित" },
};

const TRACKS = {
  1: {
    nameEn: "Spark",
    nameMr: "प्रेरणा",
    supportEn: "Village opportunity sessions, local success stories, idea-finding workshop",
    supportMr: "गावातील संधी सत्रं, स्थानिक यशोगाथा, कल्पना शोध कार्यशाळा",
  },
  2: {
    nameEn: "Start",
    nameMr: "सुरुवात",
    supportEn: "Business planning, training on gap areas, loan and scheme guidance",
    supportMr: "व्यवसाय नियोजन, आवश्यक कौशल्य प्रशिक्षण, कर्ज आणि योजना मार्गदर्शन",
  },
  3: {
    nameEn: "Run",
    nameMr: "सातत्य",
    supportEn: "Marketing, finance, GST and record-keeping modules",
    supportMr: "मार्केटिंग, अर्थ, जीएसटी आणि हिशेब ठेवणीचे मॉड्यूल",
  },
  4: {
    nameEn: "Scale",
    nameMr: "विस्तार",
    supportEn: "Mentoring, market linkage, funding and partnerships",
    supportMr: "मार्गदर्शन, बाजारपेठेशी जोडणी, निधी आणि भागीदारी",
  },
};

export default function AssessmentComplete({
  completedAt,
  onRetake,
  saving,
  onBackToJourney,
  profile,
  celebrate,
}) {
  const { lang } = useLang();

  useEffect(() => {
    if (!celebrate) return;
    const colors = ["#F97316", "#142952", "#1A7A3C", "#560A0A", "#fbbf24", "#ffffff"];
    const origins = [0.2, 0.5, 0.8];
    const timers = origins.map((x, i) =>
      setTimeout(() => {
        confetti({
          particleCount: 90,
          angle: 90,
          spread: 80,
          startVelocity: 50,
          gravity: 1,
          ticks: 300,
          origin: { x, y: -0.04 },
          colors,
          shapes: ["square", "circle"],
          scalar: 1.05,
          zIndex: 10001,
        });
      }, i * 500)
    );
    return () => {
      timers.forEach(clearTimeout);
      confetti.reset();
    };
  }, [celebrate]);

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const track = TRACKS[profile?.track] || null;
  const stage = STAGE_LABELS[profile?.stage] || null;
  const style = STYLE_LABELS[profile?.style] || null;

  const label = (item) => (item ? (lang === "mr" ? item.mr : item.en) : "—");

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
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
              color: "#fff",
            }}
          >
            <PartyPopper size={50} />
          </div>
          <h2 style={{ color: "#fff", margin: 0, fontSize: 24, fontWeight: 800 }}>
            {lang === "mr" ? "मूल्यांकन पूर्ण झाले!" : "Assessment Complete!"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", margin: "8px 0 0", fontSize: 15 }}>
            {lang === "mr"
              ? "तुमची उत्तरं जतन झाली आहेत आणि तुमची मदत-प्रोफाइल तयार आहे."
              : "Your answers are saved and your support profile is ready."}
          </p>
        </div>

        <div style={{ padding: "32px 28px" }}>
          <div
            style={{
              width: 150,
              height: 150,
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
            <span style={{ display: "flex", color: "#fff" }}>
              <Trophy size={38} />
            </span>
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
              {track
                ? lang === "mr"
                  ? track.nameMr
                  : track.nameEn
                : lang === "mr"
                ? "पूर्ण"
                : "COMPLETED"}
            </span>
          </div>

          {formattedDate && (
            <p style={{ fontSize: 13, color: C.textopa, margin: "0 0 24px" }}>
              {lang === "mr" ? "पूर्ण झालं" : "Completed on"}:{" "}
              <span style={{ fontWeight: 700, color: C.navy }}>{formattedDate}</span>
            </p>
          )}

          {track && (
            <div
              style={{
                background: "#fff7ed",
                border: "2px solid #fdba74",
                borderRadius: 14,
                padding: "18px 20px",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Route size={17} color={C.orange} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#9a3412" }}>
                  {lang === "mr" ? "तुमचा मार्ग (Track)" : "Your support track"}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.orange }}>
                {lang === "mr" ? track.nameMr : track.nameEn}
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 13, color: "#7c2d12", lineHeight: 1.6 }}>
                {lang === "mr" ? track.supportMr : track.supportEn}
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                flex: "1 1 160px",
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Compass size={15} color={C.navy} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>
                  {lang === "mr" ? "टप्पा" : "Stage"}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{label(stage)}</div>
            </div>

            <div
              style={{
                flex: "1 1 160px",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Target size={15} color="#166534" />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>
                  {lang === "mr" ? "कार्यशैली" : "Working style"}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#166534" }}>{label(style)}</div>
            </div>
          </div>

          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "#166534", lineHeight: 1.6 }}>
              {lang === "mr"
                ? "तुमच्या उत्तरांवरून GTU तुम्हाला योग्य प्रशिक्षण, मार्गदर्शन आणि योजनांची माहिती देऊ शकतं."
                : "Based on your answers, GTU can guide you with the right training, mentoring and scheme support."}
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
                }}
              >
                {lang === "mr" ? "डॅशबोर्डवर जा" : "Back to Dashboard"}
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
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <RotateCcw size={15} />
                  {lang === "mr" ? "पुन्हा प्रयत्न करा" : "Retake Assessment"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
