import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [authReady, setAuthReady] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    api.get("/users/me")
    .then((res) => {
      const currentUser = res?.data ?? res;

      if (!currentUser?._id) {
        throw new Error("Invalid user payload from /users/me");
      }

      if (currentUser.isActive === false) {
        logout();
        return;
      }

      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
    })
      .catch((err) => {
        if (err.response?.status === 401) {
          logout();
        } else {
          const cachedUser = getStoredUser();
          if (cachedUser?._id) {
            setUser(cachedUser);
            console.warn("Auth check failed; using cached session");
          } else {
            logout();
          }
        }
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
