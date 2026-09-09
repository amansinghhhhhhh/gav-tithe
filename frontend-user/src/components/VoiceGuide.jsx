import { useState } from "react";
import { useLang } from "../context/LangContext";

export default function VoiceGuide({ textKey, style }) {
  const { t, lang } = useLang();
  const [speaking, setSpeaking] = useState(false);

  const speak = () => {
    if (!window.speechSynthesis) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(t(textKey));
    utter.lang = lang === "mr" ? "mr-IN" : "en-US";
    utter.rate = 0.9;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  return (
    <button
      onClick={speak}
      title={lang === "mr" ? "सुना" : "Listen"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        background: speaking ? "#F97316" : "#f3f4f6",
        color: speaking ? "#fff" : "#F97316",
        fontSize: 16,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.2s",
        ...style,
      }}
    >
      {speaking ? "⏸" : "🔊"}
    </button>
  );
}
