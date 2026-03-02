import { createContext, useContext, useState, useEffect } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  const [channelSearch, setChannelSearch] = useState("");
  const [notifications, setNotifications] = useState([]);

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("notifications", notificationsEnabled);
  }, [notificationsEnabled]);

  const addNotification = (n) => {
    setNotifications((prev) => [n, ...prev]);
  };

  const setInitialNotifications = (list) => {
    setNotifications(list);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // ✅ HELPERS (non-breaking)
  const openThread = (message) => {
    setActiveThread(message);
    setShowThreadPanel(true);
  };

  const closeThread = () => {
    setActiveThread(null);
    setShowThreadPanel(false);
  };

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
        setNotificationsEnabled
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
