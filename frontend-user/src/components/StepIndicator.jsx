import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import C from "../constants/colors";

const STEP_PROGRESS = { 1: 0, 2: 25, 3: 50, 4: 75 };

export function StepIndicator({ current }) {
  const { t } = useLang();
  const { user } = useAuth();

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];
  const progress = STEP_PROGRESS[current] ?? 0;

  // ── Fix 1: Sirf userName dikhao ──────────────────────────────────────────
  const displayName = user?.name || "User";
  const avatarText = user?.name ? user.name[0].toUpperCase() : "U";

  return (
    <>
      {/* ── Welcome + Progress Banner ── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${C.maroon} 0%, #8B1A1A 60%, #A0522D 100%)`,
          borderRadius: 14,
          padding: "20px 28px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          boxShadow: "0 4px 20px rgba(86,10,10,0.35)",
        }}
        className="md:flex-row flex-col"
      >
        {/* Left: Avatar + Text */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
          className="w-[100%]"
        >
          {/* Avatar row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#c0a060",
                border: "2px solid rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {avatarText}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                {t("banner_greeting")} {displayName}!
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {t("banner_subtitle")}
              </div>
            </div>
          </div>

          {/* Next action card */}
          <div
            style={{
              background: "rgba(0,0,0,0.25)",
              borderRadius: 10,
              padding: "12px 16px",
              maxWidth: 380,
              textAlign: "left",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {t("banner_next_title")}
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {t("banner_next_desc")}
            </div>
            <button
              style={{
                background: C.maroon,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 20,
                padding: "6px 16px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ▶ {t("banner_cta")} {current}
            </button>
          </div>
        </div>

        {/* Right: MUI Circular Progress */}
        <Box
          sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={90}
            thickness={4}
            sx={{
              color: "rgba(255,255,255,0.15)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <CircularProgress
            variant="determinate"
            value={progress}
            size={90}
            thickness={4}
            sx={{
              color: "#fff",
              "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              {progress}%
            </span>
          </Box>
        </Box>
      </div>

      {/* ── Form Title Banner ── */}
      <div
        style={{
          background: C.white,
          padding: "24px 30px",
          marginBottom: 20,
          borderRadius: 10,
        }}
      >
        <h2 style={{ color: C.maroon, fontWeight: 700, margin: "0 0 6px" }}>
          {t("form_title")}
        </h2>
        <p style={{ color: "#333", fontWeight: 500, margin: "0 0 4px" }}>
          {t("form_welcome")}
        </p>
        <p style={{ color: "#777", fontWeight: 400, margin: 0 }}>
          {t("form_subtitle")}
        </p>
      </div>

      {/* ── Step Circles ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0,
          marginBottom: 28,
        }}
      >
        {steps.map((s, i) => {
          const n = i + 1,
            done = n < current,
            active = n === current;
          return (
            <div key={n} style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    background: done ? C.green : active ? C.maroon : "#ddd",
                    color: done || active ? "#fff" : "#888",
                    border: active ? `3px solid ${C.maroon}` : "none",
                  }}
                >
                  {done ? "✓" : n}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: active ? C.maroon : done ? C.green : "#888",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {s}
                </span>
              </div>
              {i < 3 && (
                <div
                  style={{
                    width: 50,
                    height: 2,
                    background: done ? C.green : "#ddd",
                    margin: "0 4px",
                    marginBottom: 20,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
