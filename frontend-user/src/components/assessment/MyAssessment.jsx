import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import C from "../../constants/colors";
import { useLang } from "../../context/LangContext";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../shared/Spinner";
import {
  getMyAssessment,
  saveAssessmentRespondent,
  saveAssessmentAnswer,
  completeAssessment,
  retakeAssessment,
} from "../../services/api";
import { ClipboardList, Rocket, ArrowLeft, ArrowRight, Check } from "lucide-react";
import QuestionStep from "./QuestionStep";
import AssessmentComplete from "./AssessmentComplete";
import RespondentForm from "./RespondentForm";

export default function MyAssessment() {
  const { lang } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [justCompleted, setJustCompleted] = useState(false);
  const [saveError, setSaveError] = useState("");

  const questions = assessment?.questions || [];
  const total = questions.length;
  const respondentReady = !!assessment?.respondent?.savedAt;

  const loadAssessment = async () => {
    setLoading(true);
    try {
      const res = await getMyAssessment();
      if (res.success && res.assessment) {
        const a = res.assessment;
        setAssessment(a);

        const answersMap = {};
        for (const ans of a.answers || []) {
          answersMap[ans.questionId] = {
            selectedOptions: ans.selectedOptions || [],
            text: ans.text || "",
          };
        }
        setAnswers(answersMap);

        const count = (a.questions || []).length || a.totalQuestions || 1;
        const savedStep = Math.min(Math.max(a.currentStep || 1, 1), count);

        if (a.completed) {
          setShowIntro(false);
          setCurrentStep(count);
          setJustCompleted(false);
        } else if ((a.answers || []).length > 0) {
          setCurrentStep(savedStep);
          setShowIntro(false);
        } else {
          setCurrentStep(1);
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

  const isAnswered = (question) => {
    const a = answers[question.id];
    if (!a) return false;
    if (question.type === "text") return !!String(a.text || "").trim();
    return (a.selectedOptions || []).length > 0;
  };

  const firstUnansweredIndex = () => {
    for (let i = 0; i < total; i++) {
      if (!isAnswered(questions[i])) return i + 1;
    }
    return total;
  };

  const handleStart = () => {
    setShowIntro(false);
    setSaveError("");
    setCurrentStep(firstUnansweredIndex());
  };

  const handleRespondentSave = async (data) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await saveAssessmentRespondent(data);
      if (res.success) {
        setAssessment((prev) => ({ ...prev, respondent: { ...res.respondent } }));
      }
    } catch (err) {
      setSaveError(
        lang === "mr"
          ? "माहिती जतन करता आली नाही. पुन्हा प्रयत्न करा."
          : "Could not save your details. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const persistAnswer = async (question, selectedOptions, text) => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await saveAssessmentAnswer(question.id, selectedOptions, text);
      if (res.success) {
        setAssessment((prev) =>
          prev ? { ...prev, currentStep: res.currentStep } : prev
        );
        return true;
      }
    } catch (err) {
      setSaveError(
        lang === "mr"
          ? "उत्तर जतन करता आले नाही. पुन्हा प्रयत्न करा."
          : "Could not save your answer. Please try again."
      );
    } finally {
      setSaving(false);
    }
    return false;
  };

  const handleSelect = async (question, selectedOptions) => {
    const prev = answers[question.id];
    setAnswers((map) => ({
      ...map,
      [question.id]: { selectedOptions, text: "" },
    }));

    const ok = await persistAnswer(question, selectedOptions, "");
    if (!ok) {
      setAnswers((map) => {
        const next = { ...map };
        if (prev) next[question.id] = prev;
        else delete next[question.id];
        return next;
      });
    }
  };

  const handleTextChange = (question, value, saveNow = false) => {
    setAnswers((map) => ({
      ...map,
      [question.id]: { selectedOptions: [], text: value },
    }));
    if (saveNow) persistAnswer(question, [], value);
  };

  const handleNext = async () => {
    const question = questions[currentStep - 1];
    if (!question) return;

    if (question.type === "text") {
      const value = String(answers[question.id]?.text || "").trim();
      if (question.required !== false && !value) {
        setSaveError(
          lang === "mr" ? "कृपया उत्तर लिहा." : "Please write your answer."
        );
        return;
      }
      const ok = await persistAnswer(question, [], value);
      if (!ok) return;
    }

    if (currentStep < total) {
      setSaveError("");
      setCurrentStep(currentStep + 1);
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const res = await completeAssessment();
      if (res.success) {
        setAssessment((prev) => ({
          ...prev,
          completed: true,
          completedAt: res.completedAt,
          profile: res.profile,
          totalAttempts: res.totalAttempts,
        }));
        setJustCompleted(true);
      }
    } catch (err) {
      setSaveError(
        lang === "mr"
          ? "मूल्यांकन पूर्ण करता आले नाही. सर्व आवश्यक उत्तरं भरलेली आहेत का ते तपासा."
          : "Could not complete the assessment. Please check all required answers."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setSaveError("");
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
        setJustCompleted(false);
        setSaveError("");
        setAssessment((prev) => ({
          ...prev,
          completed: false,
          completedAt: null,
          profile: {},
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
    navigate("/dashboard");
  };

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(q)).length,
    [questions, answers]
  );

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

  if (assessment?.completed) {
    return (
      <AssessmentComplete
        completedAt={assessment.completedAt}
        onRetake={handleRetake}
        saving={saving}
        onBackToJourney={handleBackToJourney}
        profile={assessment.profile}
        celebrate={justCompleted}
      />
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: C.textopa }}>
        {lang === "mr"
          ? "मूल्यांकन लोड करता आले नाही. पुन्हा प्रयत्न करा."
          : "Could not load the assessment. Please try again."}
      </div>
    );
  }

  if (showIntro) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
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
              }}
            >
              <ClipboardList size={30} color="#fff" />
            </div>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 800 }}>
              {lang === "mr" ? "GTU उद्योजक मूल्यांकन" : "GTU Entrepreneur Assessment"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.75)", margin: "8px 0 0", fontSize: 14 }}>
              {lang === "mr"
                ? "तुमच्या उद्योजकीय तयारीचे मूल्यांकन"
                : "Assessment of your entrepreneurial readiness"}
            </p>
          </div>

          <div style={{ padding: "28px" }}>
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "18px 20px",
                marginBottom: 20,
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: C.navy }}>
                {lang === "mr" ? "GTU हे मूल्यांकन का घेते?" : "Why is GTU conducting this assessment?"}
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                {lang === "mr"
                  ? "GTU (गाव तिठे उद्योजक) तुमचा उद्योजकीय प्रवास, सध्याची तयारी आणि तुम्हाला लागणारी मदत समजून घेण्यासाठी हे मूल्यांकन घेत आहे. तुमच्या उत्तरांवरून आम्ही तुम्हाला योग्य मार्गदर्शन, प्रशिक्षण आणि साधने उपलब्ध करून देऊ शकतो."
                  : "GTU (Gaon Tithe Udyojak) is conducting this assessment to understand your entrepreneurial journey, your current readiness, and the support you need. Your answers help us provide the right guidance, training, and resources."}
              </p>
            </div>

            {Object.keys(answers).length > 0 && (
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
                  ? `तुम्ही आधीच ${answeredCount}/${total} प्रश्नांना उत्तर दिले आहे. जिथे थांबला होता तिथून सुरू करा.`
                  : `You've already answered ${answeredCount}/${total} questions. Resume from where you left off.`}
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Rocket size={17} />
              {Object.keys(answers).length > 0
                ? lang === "mr"
                  ? "मूल्यांकन पुन्हा सुरू करा"
                  : "Resume Assessment"
                : lang === "mr"
                ? "मूल्यांकन सुरू करा"
                : "Start Assessment"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!respondentReady) {
    return (
      <RespondentForm
        user={user}
        initial={assessment.respondent}
        onSave={handleRespondentSave}
        saving={saving}
        lang={lang}
        serverError={saveError}
      />
    );
  }

  const question = questions[currentStep - 1];
  const currentAnswer = answers[question.id] || { selectedOptions: [], text: "" };
  const canProceed =
    isAnswered(question) || (question.type === "text" && question.required === false);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 20px" }}>
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
          <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
            {lang === "mr" ? "प्रगती" : "Progress"}
          </span>
          <span style={{ fontSize: 13, color: C.textopa }}>
            {answeredCount}/{total} {lang === "mr" ? "उत्तर दिली" : "answered"}
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
              width: `${(answeredCount / total) * 100}%`,
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
        {questions.map((q, i) => {
          const step = i + 1;
          const done = isAnswered(q);
          const isCurrent = step === currentStep;
          return (
            <div
              key={`${q.id}-${step}`}
              onClick={() => {
                if (done || isCurrent) setCurrentStep(step);
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
                cursor: done || isCurrent ? "pointer" : "default",
                background: isCurrent ? C.orange : done ? C.green : "#e5e7eb",
                color: isCurrent || done ? "#fff" : "#9ca3af",
                transition: "all 0.2s",
              }}
            >
              {step}
            </div>
          );
        })}
      </div>

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
            {lang === "mr" ? "जतन होत आहे..." : "Saving..."}
          </span>
        </div>
      )}

      {saveError && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {saveError}
        </div>
      )}

      <QuestionStep
        question={question}
        index={currentStep}
        total={total}
        selectedOptions={currentAnswer.selectedOptions}
        textValue={currentAnswer.text}
        onSelect={(opts) => handleSelect(question, opts)}
        onTextChange={(value, saveNow) => handleTextChange(question, value, saveNow)}
        lang={lang}
        disabled={saving}
      />

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <ArrowLeft size={15} /> {lang === "mr" ? "मागे" : "Back"}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          style={{
            flex: 2,
            padding: "13px 0",
            background:
              !canProceed || saving
                ? "#e5e7eb"
                : `linear-gradient(135deg, ${C.orange}, #fb923c)`,
            color: !canProceed || saving ? "#9ca3af" : "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            cursor: !canProceed || saving ? "not-allowed" : "pointer",
            boxShadow: canProceed && !saving ? "0 4px 14px rgba(249,115,22,0.35)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          {currentStep === total ? (
            <>
              <Check size={16} strokeWidth={3} />
              {lang === "mr" ? "पूर्ण करा" : "Complete"}
            </>
          ) : (
            <>
              {lang === "mr" ? "पुढे" : "Next"} <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
