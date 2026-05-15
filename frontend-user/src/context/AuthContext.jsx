import { createContext, useContext, useEffect, useState } from "react";
import { getMe, getToken, clearToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        const data = await getMe();
        if (data.success) {
          setUser(data.user);
        } else {
          clearToken();
          localStorage.removeItem("otp_verified"); // token invalid → clear
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem("otp_verified"); // ✅ logout pe clear karo
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
