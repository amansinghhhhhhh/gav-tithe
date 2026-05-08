import { createContext, useContext, useEffect, useState } from "react";
import { getMe, getToken, clearToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App load pe token check karo → user load karo
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        const data = await getMe();
        if (data.success) {
          setUser(data.user); // name, email, mobile, role sab aayega
        } else {
          clearToken();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  // Login ke baad user set karo
  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
