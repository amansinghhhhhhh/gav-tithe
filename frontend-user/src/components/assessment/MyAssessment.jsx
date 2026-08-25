import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import C from "../../constants/colors";
import { useLang } from "../../context/LangContext";
import { Spinner } from "../shared/Spinner";
import {
  getMyAssessment,
  saveAssessmentAnswer,
  completeAssessment,
  retakeAssessment,
} from "../../services/api";
import { questions } from "../../constants/assessmentQuestions";
import QuestionStep from "./QuestionStep";
import AssessmentComplete from "./AssessmentComplete";

export default function MyAssessment() {
  const { lang } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const res = await getMyAssessment();
      if (res.success && res.assessment) {
        const a = res.assessment;
        setAssessment(a);

        // Restore answers from backend
        const answersMap = {};
        if (a.answers) {
          for (const ans of a.answers) {
            answersMap[ans.questionIndex + 1] = ans.selectedOptions;
          }
        }
        setAnswers(answersMap);

        if (a.completed) {
          setShowIntro(false);
          setCurrentStep(16); // Show completed
        } else if (a.answers && a.answers.length > 0) {
          // Resume from first unanswered
          setCurrentStep(a.currentStep || 1);
          setShowIntro(false);
        }
      }
    } catch (err) {
      console.error("Load assessment error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, []);

  const handleStart = () => {
    setShowIntro(false);
    setCurrentStep(1);
  };

  const handleAnswer = async (step, selectedOptions) => {
    setSaving(true);
    try {
      const res = await saveAssessmentAnswer(step, selectedOptions);
      if (res.success) {
        setAnswers((prev) => ({ ...prev, [step]: selectedOptions }));
      }
    } catch (err) {
      console.error("Save answer error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < 15) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete assessment
      setSaving(true);
      try {
        const res = await completeAssessment();
        if (res.success) {
          setCurrentStep(16); // Show completed
          setAssessment((prev) => ({ ...prev, completed: true }));
        }
      } catch (err) {
        console.error("Complete error:", err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRetake = async () => {
    setSaving(true);
    try {
      const res = await retakeAssessment();
      if (res.success) {
        setAnswers({});
        setCurrentStep(1);
        setShowIntro(true);
        setAssessment((prev) => ({
          ...prev,
          completed: false,
          answers: [],
          currentStep: 1,
        }));
      }
    } catch (err) {
      console.error("Retake error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToJourney = () => {
    navigate("/");
  };

  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          height: "60vh",
        }}
      >
        <Spinner size={52} />
        <div style={{ color: C.maroon, fontWeight: 600, fontSize: 15 }}>
          Loading assessment...
        </div>
      </div>
    );
  }

  // Show completed screen
  if (assessment?.completed && currentStep === 16) {
    return (
      <AssessmentComplete
        completedAt={assessment.completedAt}
        onRetake={handleRetake}
        saving={saving}
        onBackToJourney={handleBackToJourney}
        score={assessment.score}
      />
    );
  }

  // Show intro screen
  if (showIntro) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.navy} 0%, #1e3a6e 100%)`,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 30,
              }}
            >
              📋
            </div>
            <h2
              style={{
                color: "#fff",
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              {lang === "mr"
                ? "उद्योजक मनोवृत्ती निर्मिती"
                : "Entrepreneurial Mindset Creation"}
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                margin: "8px 0 0",
                fontSize: 14,
              }}
            >
              {lang === "mr"
                ? "तुमच्या उद्योजक तयारीचा चाचणी"
                : "Assessment of your entrepreneurial readiness"}
            </p>
          </div>

          {/* Content */}
          <div style={{ padding: "28px" }}>
            <div
              style={{
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 20,
              }}
            >
              <h3
                style={{
                  margin: "0 0 12px",
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.navy,
                }}
              >
                {lang === "mr" ? "सूचना" : "Instructions"}
              </h3>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.8,
                }}
              >
                <li>
                  {lang === "mr"
                    ? "एकूण १५ प्रश्न आहेत"
                    : "There are 15 questions in total"}
                </li>
                <li>
                  {lang === "mr"
                    ? "प्रत्येक प्रश्नासाठी एक किंवा अधिक उत्तरे निवडू शकता"
                    : "You can select one or more answers per question"}
                </li>
                <li>
                  {lang === "mr"
                    ? "पुढच्या प्रश्नावर जाण्यापूर्वी सध्याचे उत्तर सेव्ह करा"
                    : "Save your current answer before moving to the next question"}
                </li>
                <li>
                  {lang === "mr"
                    ? "तुम्ही कोणत्याही वेळी परत जाऊ शकता"
                    : "You can go back at any time"}
                </li>
                <li>
                  {lang === "mr"
                    ? "पूर्ण झाल्यावर पुन्हा प्रयत्न करता येतो"
                    : "You can retake after completion"}
                </li>
              </ul>
            </div>

            {assessment?.answers?.length > 0 && !assessment.completed && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fdba74",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: 14,
                  color: "#9a3412",
                  fontWeight: 600,
                }}
              >
                {lang === "mr"
                  ? `तुम्ही आधीच ${assessment.answers.length}/१५ प्रश्नांना उत्तर दिले आहे. पुन्हा सुरू करा.`
                  : `You've already answered ${assessment.answers.length}/15 questions. Resume from where you left off.`}
              </div>
            )}

            <button
              onClick={handleStart}
              style={{
                width: "100%",
                padding: "14px 0",
                background: `linear-gradient(135deg, ${C.orange}, #fb923c)`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
              }}
            >
              {assessment?.answers?.length > 0 && !assessment.completed
                ? lang === "mr"
                  ? "🚀 पुन्हा सुरू करा"
                  : "🚀 Resume Assessment"
                : lang === "mr"
                ? "🚀 सुरू करा"
                : "🚀 Start Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show quiz
  const question = questions[currentStep - 1];
  const currentAnswer = answers[currentStep] || [];

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <span
            style={{ fontSize: 14, fontWeight: 700, color: C.navy }}
          >
            {lang === "mr" ? "प्रगती" : "Progress"}
          </span>
          <span style={{ fontSize: 13, color: C.textopa }}>
            {answeredCount}/15 {lang === "mr" ? "उत्तरे" : "answered"}
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "#e5e7eb",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${(answeredCount / 15) * 100}%`,
              height: "100%",
              background: C.green,
              borderRadius: 4,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {Array.from({ length: 15 }, (_, i) => {
          const step = i + 1;
          const isAnswered = !!answers[step];
          const isCurrent = step === currentStep;
          return (
            <div
              key={step}
              onClick={() => {
                if (isAnswered || isCurrent) setCurrentStep(step);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                cursor: isAnswered || isCurrent ? "pointer" : "default",
                background: isCurrent
                  ? C.orange
                  : isAnswered
                  ? C.green
                  : "#e5e7eb",
                color: isCurrent || isAnswered ? "#fff" : "#9ca3af",
                transition: "all 0.2s",
              }}
            >
              {step}
            </div>
          );
        })}
      </div>

      {/* Saving indicator */}
      {saving && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Spinner size={18} />
          <span style={{ fontSize: 13, color: C.maroon, fontWeight: 600 }}>
            Saving...
          </span>
        </div>
      )}

      {/* Question */}
      {question && (
        <QuestionStep
          question={question}
          step={currentStep}
          selectedOptions={currentAnswer}
          onSelect={(opts) => handleAnswer(currentStep, opts)}
          lang={lang}
        />
      )}

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 20,
        }}
      >
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          style={{
            flex: 1,
            padding: "13px 0",
            background: currentStep === 1 ? "#e5e7eb" : "#fff",
            color: currentStep === 1 ? "#9ca3af" : C.navy,
            border: `1.5px solid ${currentStep === 1 ? "#e5e7eb" : "#d1d5db"}`,
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
          }}
        >
          ← {lang === "mr" ? "मागे" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[currentStep] || answers[currentStep].length === 0 || saving}
          style={{
            flex: 2,
            padding: "13px 0",
            background:
              !answers[currentStep] || answers[currentStep].length === 0 || saving
                ? "#e5e7eb"
                : `linear-gradient(135deg, ${C.orange}, #fb923c)`,
            color:
              !answers[currentStep] || answers[currentStep].length === 0 || saving
                ? "#9ca3af"
                : "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor:
              !answers[currentStep] || answers[currentStep].length === 0 || saving
                ? "not-allowed"
                : "pointer",
            boxShadow:
              answers[currentStep] && answers[currentStep].length > 0
                ? "0 4px 14px rgba(249,115,22,0.35)"
                : "none",
          }}
        >
          {currentStep === 15
            ? lang === "mr"
              ? "✅ पूर्ण करा"
              : "✅ Complete"
            : lang === "mr"
            ? "पुढे →"
            : "Next →"}
        </button>
      </div>
    </div>
  );
}
