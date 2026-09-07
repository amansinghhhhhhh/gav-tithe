import { useState } from "react";
import { useLang } from "../context/LangContext";
import videoSrc from "../assets/gtu-register.mp4";

export default function WatchVideoButton() {
  const { t } = useLang();
  const [dismissed, setDismissed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <style>{`
        @keyframes wvPulse {
          0%, 100% { box-shadow: 0 4px 18px rgba(249,115,22,0.45), 0 0 0 0 rgba(249,115,22,0.6); }
          50% { box-shadow: 0 4px 18px rgba(249,115,22,0.45), 0 0 0 12px rgba(249,115,22,0); }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          bottom: 90,
          right: 24,
          zIndex: 9998,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {!dismissed && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "#fff",
              borderRadius: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
              padding: "8px 14px",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#142952",
                whiteSpace: "nowrap",
              }}
            >
              {t("watch_video_title")}
            </span>
            <button
              onClick={() => setDismissed(true)}
              style={{
                position: "absolute",
                top: -8,
                left: -8,
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "none",
                background: "#e5e7eb",
                color: "#6b7280",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
              }}
            >
              ✕
            </button>
          </div>
        )}
        <button
          onClick={() => setShowVideo(true)}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F97316, #fb923c)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            animation: "wvPulse 2s infinite",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 18px rgba(249,115,22,0.45)",
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>

      {showVideo && (
        <div
          onClick={() => setShowVideo(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#000",
              borderRadius: 16,
              width: "100%",
              maxWidth: 360,
              maxHeight: "85vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                background: "#1a1a1a",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                {t("watch_video_title")}
              </span>
              <button
                onClick={() => setShowVideo(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <video
              src={videoSrc}
              controls
              autoPlay
              style={{
                width: "100%",
                aspectRatio: "9/16",
                objectFit: "contain",
                background: "#000",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
