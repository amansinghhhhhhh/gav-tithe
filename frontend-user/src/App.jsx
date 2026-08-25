import { useState, useReducer, useRef, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LangProvider } from "./context/LangContext";
import { useLang } from "./context/LangContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import reducer, { initialState } from "./store/reducer";
import Sidebar from "./components/Sidebar";
import { StepIndicator } from "./components/StepIndicator";
import { FooterBar } from "./components/FooterBar";
import Section1 from "./components/sections/Section1";
import Section2 from "./components/sections/Section2";
import Section3 from "./components/sections/Section3";
import Section4 from "./components/sections/Section4";
import C from "./constants/colors";
import { SuccessPage } from "./SuccessPage";
import { submitForm, saveSection, getMyForm, getMyAssessment } from "./services/api";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import StatusCheckPage from "./StatusCheckPage";
import MyAssessment from "./components/assessment/MyAssessment";
import { Spinner } from "./components/shared/Spinner";
import { RegistrationPopup } from "./components/RegistrationPopup";

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          height: "100vh",
        }}
      >
        <Spinner size={56} />
        <div style={{ color: C.maroon, fontWeight: 700, fontSize: 15 }}>Loading...</div>
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [activeNav, setActiveNav] = useState("my_journey");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [loadingForm, setLoadingForm] = useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const { currentStep, submitted } = state;
  const validateAndGoNext = useRef(null);

  const loadFormData = async (silent = false) => {
    if (!silent) setLoadingForm(true);
    try {
      const [formRes, assessRes] = await Promise.all([
        getMyForm(),
        getMyAssessment().catch(() => null),
      ]);
      if (formRes.success && formRes.form) {
        const { section1, section2, section3, section4, status, editAllowed } = formRes.form;
        if (section1)
          dispatch({ type: "UPDATE_SECTION1", payload: section1 });
        if (section2)
          dispatch({ type: "UPDATE_SECTION2", payload: section2 });
        if (section3)
          dispatch({ type: "UPDATE_SECTION3", payload: section3 });
        if (section4)
          dispatch({ type: "UPDATE_SECTION4", payload: section4 });
        dispatch({ type: "SET_EDIT_ALLOWED", value: !!editAllowed });
        if (status === "submitted" && !editAllowed)
          dispatch({ type: "SUBMIT" });
        else if (section4?.aadhaar)
          dispatch({ type: "SET_STEP", step: 4 });
        else if (section3?.cibilScore)
          dispatch({ type: "SET_STEP", step: 4 });
        else if (section2?.businessType)
          dispatch({ type: "SET_STEP", step: 3 });
        else if (section1?.fullName) dispatch({ type: "SET_STEP", step: 2 });
      }
      if (assessRes?.success && assessRes.assessment) {
        setAssessmentCompleted(assessRes.assessment.completed);
        setAssessmentScore(assessRes.assessment.score || 0);
      }
    } catch (err) {
      console.error("Draft load error:", err);
    } finally {
      if (!silent) setLoadingForm(false);
    }
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const showMsg = (msg, isError = false) => {
    setSaveMsg({ text: msg, error: isError });
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveCurrent = async (step = currentStep) => {
    setSaving(true);
    try {
      const res = await saveSection(`section${step}`, state[`section${step}`]);
      if (!res.success) throw new Error(res.message);
      return true;
    } catch (err) {
      showMsg("Save failed: " + err.message, true);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (validateAndGoNext.current) validateAndGoNext.current();
  };

  const goNext = async () => {
    if (currentStep === 1 && !assessmentCompleted) {
      showMsg("⚠ Please complete the Mindset Assessment first", true);
      return;
    }
    const saved = await saveCurrent(currentStep);
    if (saved) {
      showMsg("✅ Saved!");
      dispatch({ type: "SET_STEP", step: Math.min(4, currentStep + 1) });
    }
  };

  const goBack = () =>
    dispatch({ type: "SET_STEP", step: Math.max(1, currentStep - 1) });

  const handleSaveDraft = async () => {
    const saved = await saveCurrent(currentStep);
    if (saved) showMsg("✅ Draft saved!");
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = {
        section1: state.section1,
        section2: state.section2,
        section3: state.section3,
        section4: state.section4,
      };
      const res = await submitForm(data);
      if (res.success) {
        dispatch({ type: "SET_EDIT_ALLOWED", value: false });
        dispatch({ type: "SUBMIT" });
      }
      else showMsg("Submit failed: " + res.message, true);
    } catch (err) {
      showMsg("Submit failed: " + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  const isMobile = window.innerWidth < 1200;
  const mainStyle = {
    maxWidth: 1160,
    margin: "0 auto",
    padding: isMobile ? "80px 24px 28px" : "28px 24px",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Sidebar
        activeKey={activeNav}
        onNav={setActiveNav}
        onLogout={handleLogout}
      />
      <div style={{ flex: 1, background: C.light, overflowY: "auto" }}>
        <main style={mainStyle}>
          {/* Toast */}
          {saveMsg && (
            <div
              style={{
                position: "fixed",
                top: 20,
                right: 24,
                zIndex: 9999,
                background: saveMsg.error ? "#fee2e2" : "#dcfce7",
                border: `1px solid ${saveMsg.error ? "#fca5a5" : "#86efac"}`,
                color: saveMsg.error ? "#991b1b" : "#166534",
                padding: "10px 20px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {saveMsg.text}
            </div>
          )}

          {loadingForm ? (
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
              <Spinner size={64} />
              <div style={{ color: C.maroon, fontWeight: 600, fontSize: 15 }}>
                Loading your form...
              </div>
            </div>
          ) : activeNav === "my_assessment" ? (
            <MyAssessment />
          ) : submitted && !state.editAllowed ? (
            <SuccessPage
              onApproved={async () => {
                await loadFormData(true);
              }}
            />
          ) : (
            <>
              <StepIndicator
                current={currentStep}
                onStepClick={
                  state.editAllowed
                    ? (step) => {
                        saveCurrent(currentStep);
                        dispatch({ type: "SET_STEP", step });
                      }
                    : undefined
                }
              />
              {saving && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "8px",
                    marginBottom: 8,
                  }}
                >
                  <Spinner size={20} />
                  <span style={{ color: C.maroon, fontWeight: 600, fontSize: 13 }}>
                    Saving...
                  </span>
                </div>
              )}
              {currentStep === 1 && (
                <Section1
                  data={state.section1}
                  dispatch={dispatch}
                  registerNext={(fn) => {
                    validateAndGoNext.current = fn;
                  }}
                  onNext={goNext}
                  assessmentCompleted={assessmentCompleted}
                  assessmentScore={assessmentScore}
                  onGoToAssessment={() => setActiveNav("my_assessment")}
                />
              )}
              {currentStep === 2 && (
                <Section2
                  data={state.section2}
                  dispatch={dispatch}
                  registerNext={(fn) => {
                    validateAndGoNext.current = fn;
                  }}
                  onNext={goNext}
                />
              )}
              {currentStep === 3 && (
                <Section3
                  data={state.section3}
                  dispatch={dispatch}
                  registerNext={(fn) => {
                    validateAndGoNext.current = fn;
                  }}
                  onNext={goNext}
                />
              )}
              {currentStep === 4 && (
                <Section4
                  data={state.section4}
                  dispatch={dispatch}
                  editAllowed={state.editAllowed}
                  registerNext={(fn) => {
                    validateAndGoNext.current = fn;
                  }}
                  onNext={handleSubmit}
                />
              )}
              <FooterBar
                step={currentStep}
                onBack={goBack}
                onNext={handleNext}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleNext}
                isLast={currentStep === 4}
              />
            </>
          )}
        </main>
      </div>
      {!submitted && !state.editAllowed && (
        <RegistrationPopup
          title={t("popup_dash_title")}
          message={t("popup_dash_message")}
          points={[t("popup_dash_p1"), t("popup_dash_p2"), t("popup_dash_p3")]}
          cta={t("popup_dash_cta")}
        />
      )}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signin" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />{" "}
      {/* ✅ handles both modes via searchParams */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/status" element={<StatusCheckPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <AppRoutes />
      </LangProvider>
    </AuthProvider>
  );
}
