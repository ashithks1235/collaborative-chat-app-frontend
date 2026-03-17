import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false); // 🔥 new

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthReady(true);
      return;
    }

    api.get("/users/me")
      .then(res => {
        if (res.data.isActive === false) {
          logout();
        } else {
          setUser(res.data);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
        } else {
          console.warn("Auth check failed but session preserved");
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
