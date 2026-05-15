import { useState, useReducer, useRef, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { LangProvider } from "./context/LangContext";
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
import { submitForm, saveSection, getMyForm } from "./services/api";
import LoginPage from "./pages/LoginPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// ── Protected Route ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div style={{ color: C.maroon, fontWeight: 700 }}>Loading...</div>
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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currentStep, submitted } = state;
  const validateAndGoNext = useRef(null);

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await getMyForm();
        if (res.success && res.form) {
          const { section1, section2, section3, section4, status } = res.form;
          if (section1)
            dispatch({ type: "UPDATE_SECTION1", payload: section1 });
          if (section2)
            dispatch({ type: "UPDATE_SECTION2", payload: section2 });
          if (section3)
            dispatch({ type: "UPDATE_SECTION3", payload: section3 });
          if (section4)
            dispatch({ type: "UPDATE_SECTION4", payload: section4 });
          if (status === "submitted") dispatch({ type: "SUBMIT" });
          else if (section4?.aadhaar) dispatch({ type: "SET_STEP", step: 4 });
          else if (section3?.cibilScore)
            dispatch({ type: "SET_STEP", step: 4 });
          else if (section2?.businessType)
            dispatch({ type: "SET_STEP", step: 3 });
          else if (section1?.fullName) dispatch({ type: "SET_STEP", step: 2 });
        }
      } catch (err) {
        console.error("Draft load error:", err);
      } finally {
        setLoadingForm(false);
      }
    };
    loadDraft();
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
      const fd = new FormData();
      fd.append("section1", JSON.stringify(state.section1));
      fd.append("section2", JSON.stringify(state.section2));
      fd.append("section3", JSON.stringify(state.section3));
      fd.append("section4", JSON.stringify({
        aadhaar: state.section4.aadhaar,
        pan: state.section4.pan,
        bankName: state.section4.bankName,
        accountNo: state.section4.accountNo,
      }));

      const docFieldMap = {
        aadhaar: "doc_aadhaar",
        pan: "doc_pan",
        udyam: "doc_udyam",
        passport: "doc_passport",
      };
      for (const [key, fieldName] of Object.entries(docFieldMap)) {
        const file = state.section4.docs[key];
        if (file instanceof File) {
          fd.append(fieldName, file);
        }
      }

      const res = await submitForm(fd);
      if (res.success) dispatch({ type: "SUBMIT" });
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
                alignItems: "center",
                justifyContent: "center",
                height: "60vh",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ color: C.maroon, fontWeight: 600 }}>
                  Loading your form...
                </div>
              </div>
            </div>
          ) : submitted ? (
            <SuccessPage />
          ) : (
            <>
              <StepIndicator current={currentStep} />
              {saving && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    color: C.maroon,
                    fontWeight: 600,
                    fontSize: 13,
                    marginBottom: 8,
                  }}
                >
                  ⏳ Saving...
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
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />{" "}
      {/* ✅ handles both modes via searchParams */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
