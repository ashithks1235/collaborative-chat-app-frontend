import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthContext";

const UIContext = createContext();

export function UIProvider({ children }) {
  const { user } = useAuthContext();
  const userKey = user?._id || user?.id || null;

  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  const [channelSearch, setChannelSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  /* ================= THEME ================= */

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  /* ================= NOTIFICATION SETTINGS ================= */

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("notifications", notificationsEnabled);
  }, [notificationsEnabled]);

  /* ================= NOTIFICATION HELPERS ================= */

  const addNotification = useCallback((notif) => {
    setNotifications((prev) => {
      const exists = prev.some(n => n._id === notif._id);
      if (exists) return prev;

      const updated = [notif, ...prev];
      return updated.slice(0, 50);
    });
  }, []);

  const setInitialNotifications = useCallback((list) => {
    setNotifications(list);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    setNotifications([]);
    setShowThreadPanel(false);
    setActiveThread(null);
    setShowAddMember(false);
    setChannelSearch("");
  }, [userKey]);

  /* ================= THREAD HELPERS ================= */

  const openThread = useCallback((message) => {
    setActiveThread(message);
    setShowThreadPanel(true);
  }, []);

  const closeThread = useCallback(() => {
    setActiveThread(null);
    setShowThreadPanel(false);
  }, []);

  return (
    <UIContext.Provider
      value={{
        showThreadPanel,
        setShowThreadPanel,
        activeThread,
        setActiveThread,

        openThread,
        closeThread,

        channelSearch,
        setChannelSearch,

        notifications,
        addNotification,
        setInitialNotifications,
        clearNotifications,

        theme,
        setTheme,

        notificationsEnabled,
        setNotificationsEnabled,

        showAddMember,
        setShowAddMember
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
