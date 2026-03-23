import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "./AuthContext";

const UIContext = createContext();

export function UIProvider({ children }) {
  const { user } = useAuthContext();
  const userKey = user?._id || user?.id || null;

  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [activeThread, setActiveThread] = useState(null);

  const [channelSearch, setChannelSearch] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const notificationsRef = useRef([]);

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

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  /* ================= NOTIFICATION HELPERS ================= */

  const addNotification = useCallback((notif) => {
    const exists = notificationsRef.current.some(
      (notification) => notification._id === notif._id
    );

    if (exists) return;

    setNotifications((prev) => [notif, ...prev].slice(0, 50));

    if (!notif?.read) {
      setNotificationUnreadCount((prev) => prev + 1);
    }
  }, []);

  const setInitialNotifications = useCallback((list) => {
    const safeList = Array.isArray(list) ? list : [];
    setNotifications(safeList);
    setNotificationUnreadCount(
      safeList.filter((notification) => !notification.read).length
    );
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    const target = notificationsRef.current.find(
      (notification) => notification._id === id
    );

    if (!target || target.read) return;

    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification._id !== id) {
          return notification;
        }

        return { ...notification, read: true };
      })
    );

    setNotificationUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.read ? notification : { ...notification, read: true }
      )
    );
    setNotificationUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setNotificationUnreadCount(0);
  }, []);

  useEffect(() => {
    setNotifications([]);
    setNotificationUnreadCount(0);
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
        notificationUnreadCount,
        setNotificationUnreadCount,
        addNotification,
        setInitialNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
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
