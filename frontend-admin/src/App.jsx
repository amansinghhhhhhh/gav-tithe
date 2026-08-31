import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UsersList from "./pages/UsersList";
import UserDetail from "./pages/UserDetail";
import EditRequests from "./pages/EditRequests";
import Reports from "./pages/Reports";
import EntrepreneurHeatmap from "./pages/EntrepreneurHeatmap";
import DRPLibraries from "./pages/DRPLibraries";
import C from "./constants/colors";
import { Spinner } from "./components/shared/Spinner";

function ProtectedLayout({ children }) {
  const { admin, loading } = useAuth();
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
  if (!admin) return <Navigate to="/login" replace />;
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, background: C.light, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedLayout>
            <UsersList />
          </ProtectedLayout>
        }
      />
      <Route
        path="/users/:userId"
        element={
          <ProtectedLayout>
            <UserDetail />
          </ProtectedLayout>
        }
      />
      <Route
        path="/edit-requests"
        element={
          <ProtectedLayout>
            <EditRequests />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <Reports />
          </ProtectedLayout>
        }
      />
      <Route
        path="/entrepreneur-heatmap"
        element={
          <ProtectedLayout>
            <EntrepreneurHeatmap />
          </ProtectedLayout>
        }
      />
      <Route
        path="/drp-libraries"
        element={
          <ProtectedLayout>
            <DRPLibraries />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
