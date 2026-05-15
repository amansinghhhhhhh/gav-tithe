import { createContext, useContext, useState, useEffect } from "react";
import { getToken, clearToken, getMe } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        const data = await getMe();
        if (data.success && data.user?.role === "admin") {
          setAdmin(data.user);
        } else {
          clearToken();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (user) => setAdmin(user);
  const logout = () => {
    clearToken();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
