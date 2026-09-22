import { useState, useEffect, useRef } from "react";
import { useLang } from "../context/LangContext";

import voiceStep1 from "../assets/audio/voice_step1.mp3";
import voiceStep2 from "../assets/audio/voice_step2.mp3";
import voiceStep3 from "../assets/audio/voice_step3.mp3";
import voiceStep4 from "../assets/audio/voice_step4.mp3";
import voiceStep5 from "../assets/audio/voice_step5.mp3";
import loginMobile from "../assets/audio/login-mobile.mp3";
import loginEmailFile from "../assets/audio/login-email.mp3";

const audioMap = {
  voice_step1: voiceStep1,
  voice_step2: voiceStep2,
  voice_step3: voiceStep3,
  voice_step4: voiceStep4,
  voice_step5: voiceStep5,
  voice_login_mobile: loginMobile,
  voice_login_email: loginEmailFile,
};

export default function VoiceGuide({ textKey, autoPlay = false, style }) {
  const { t, lang } = useLang();
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current && lang === "mr") {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && textKey) {
      const timer = setTimeout(() => play(), 500);
      return () => {
        clearTimeout(timer);
        stop();
      };
    }
  }, [textKey, autoPlay, lang]);

  const play = () => {
    if (playingRef.current) {
      stop();
      return;
    }

    // Marathi → Pre-recorded audio files
    if (lang === "mr" && audioMap[textKey]) {
      const audio = new Audio(audioMap[textKey]);
      audio.onended = () => {
        playingRef.current = false;
        setPlaying(false);
      };
      audio.onerror = () => {
        playingRef.current = false;
        setPlaying(false);
      };
      audioRef.current = audio;
      audio.play().catch(() => {
        playingRef.current = false;
        setPlaying(false);
        audioRef.current = null;
      });
      playingRef.current = true;
      setPlaying(true);
    }
    // English → Web Speech API
    else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(t(textKey));
      utter.lang = "en-US";
      utter.rate = 0.9;
      utter.onend = () => {
        playingRef.current = false;
        setPlaying(false);
      };
      utter.onerror = () => {
        playingRef.current = false;
        setPlaying(false);
      };
      window.speechSynthesis.speak(utter);
      playingRef.current = true;
      setPlaying(true);
    }
  };

  const stop = () => {
    if (lang === "mr" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    playingRef.current = false;
    setPlaying(false);
  };

  return (
    <button
      onClick={play}
      title={lang === "mr" ? "सुना" : "Listen"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        border: "none",
        background: playing ? "#F97316" : "#f3f4f6",
        color: playing ? "#fff" : "#F97316",
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
      {playing ? "⏸" : "🔊"}
    </button>
  );
}
