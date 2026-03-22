import { createContext, useContext, useEffect, useState } from "react";
import { getMyChannels, createChannel } from "../api/channel.api";
import { useAuthContext } from "./AuthContext"; // 🔥 NEW
import api from "../api/axios";
import { useSocketContext } from "./SocketContext";
import { useLocation } from "react-router-dom";

const ChannelContext = createContext();

export function ChannelProvider({ children }) {
  const { authReady, user } = useAuthContext(); // 🔥 NEW
  const { socket } = useSocketContext();
  const location = useLocation();

  const [channels, setChannels] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const userKey = user?._id || user?.id || null;
  const unreadStorageKey = userKey ? `channel-unread:${userKey}` : null;

  const loadChannels = async () => {
    try {
      setLoading(true);
      let data;

      if (user?.role === "Admin") {
        // Super Admin → load all channels
        const res = await api.get("/admin/channels");
        const payload = res?.data ?? res;
        data = Array.isArray(payload) ? payload : payload?.channels || [];
      } else {
        // Normal users → only their channels
        const res = await api.get("/channels");
        const payload = res?.data ?? res;
        data = Array.isArray(payload) ? payload : [];
      }

      setChannels(data);
    } catch (err) {
      console.error("Failed to load channels", err);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authReady) return;

    if (!userKey) {
      setChannels([]);
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    setChannels([]);
    setLoading(true);
  }, [authReady, userKey, user?.role]);

  useEffect(() => {
    if (!unreadStorageKey) return;

    try {
      const stored = JSON.parse(localStorage.getItem(unreadStorageKey) || "{}");
      setUnreadCounts(stored && typeof stored === "object" ? stored : {});
    } catch {
      setUnreadCounts({});
    }
  }, [unreadStorageKey]);

  useEffect(() => {
    if (!unreadStorageKey) return;
    localStorage.setItem(unreadStorageKey, JSON.stringify(unreadCounts));
  }, [unreadCounts, unreadStorageKey]);

  // 🔐 WAIT FOR AUTH
  useEffect(() => {
    if (!authReady || !userKey) return;
    loadChannels();
  }, [authReady, userKey, user?.role]);

  useEffect(() => {
    if (!socket || !userKey) return;

    const handleUnreadMessage = (payload) => {
      const incomingChannelId = payload?.channelId || payload?.channel?._id || payload?.channel;
      const senderId = payload?.senderId || payload?.sender?._id || payload?.sender;
      const isOwnMessage = senderId && String(senderId) === String(userKey);

      if (!incomingChannelId || isOwnMessage) return;

      const activeChannelMatch = location.pathname.match(/^\/channel\/([^/?#]+)/);
      const activeChannelId = activeChannelMatch?.[1];

      if (String(activeChannelId) === String(incomingChannelId)) return;

      setUnreadCounts((prev) => ({
        ...prev,
        [incomingChannelId]: (prev[incomingChannelId] || 0) + 1
      }));
    };

    socket.on("channel:unread", handleUnreadMessage);

    return () => {
      socket.off("channel:unread", handleUnreadMessage);
    };
  }, [socket, userKey, location.pathname]);

  useEffect(() => {
    const activeChannelMatch = location.pathname.match(/^\/channel\/([^/?#]+)/);
    const activeChannelId = activeChannelMatch?.[1];

    if (!activeChannelId) return;

    setUnreadCounts((prev) => {
      if (!prev[activeChannelId]) return prev;

      const next = { ...prev };
      delete next[activeChannelId];
      return next;
    });
  }, [location.pathname]);

  const addChannel = async (name) => {
    const channel = await createChannel({ name });
    setChannels((prev) => [...prev, channel]);
    return channel;
  };

  const clearUnreadCount = (channelId) => {
    if (!channelId) return;

    setUnreadCounts((prev) => {
      if (!prev[channelId]) return prev;

      const next = { ...prev };
      delete next[channelId];
      return next;
    });
  };

  return (
    <ChannelContext.Provider value={{ channels, loading, addChannel, loadChannels, unreadCounts, clearUnreadCount }}>
      {children}
    </ChannelContext.Provider>
  );
}

export const useChannelContext = () => useContext(ChannelContext);
