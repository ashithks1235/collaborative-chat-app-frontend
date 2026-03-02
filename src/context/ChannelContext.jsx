import { createContext, useContext, useEffect, useState } from "react";
import { getMyChannels, createChannel } from "../api/channel.api";
import { useAuthContext } from "./AuthContext"; // 🔥 NEW
import api from "../api/axios";

const ChannelContext = createContext();

export function ChannelProvider({ children }) {
  const { authReady, user } = useAuthContext(); // 🔥 NEW

  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChannels = async () => {
    try {
      let data;

      if (user?.role === "Admin") {
        // 🔥 Super Admin → load all channels
        const res = await api.get("/admin/channels");
        data = res.data;
      } else {
        // Normal users → only their channels
        const res = await api.get("/channels");
        data = res.data;
      }

      setChannels(data);
    } catch (err) {
      console.error("Failed to load channels", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔐 WAIT FOR AUTH
  useEffect(() => {
    if (!authReady || !user) return;
    loadChannels();
  }, [authReady, user]);

  const addChannel = async (name) => {
    const channel = await createChannel({ name });
    setChannels((prev) => [...prev, channel]);
    return channel;
  };

  return (
    <ChannelContext.Provider value={{ channels, loading, addChannel, loadChannels }}>
      {children}
    </ChannelContext.Provider>
  );
}

export const useChannelContext = () => useContext(ChannelContext);
