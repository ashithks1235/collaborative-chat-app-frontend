import { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { useAuthContext } from "./AuthContext";

const MessageContext = createContext();

export function MessageProvider({ children }) {
  const { authReady, user } = useAuthContext();
  const [threadReplies, setThreadReplies] = useState({});

  /* ================= LOAD THREAD REPLIES ================= */
  const loadThreadReplies = async (parentId) => {
    if (!authReady || !user) return;

    try {
      const res = await api.get(`/messages/${parentId}/replies`);
      const payload = res?.data ?? res;

      setThreadReplies((prev) => ({
        ...prev,
        [parentId]: payload?.replies || [],
      }));
    } catch (err) {
      console.error("Load thread failed:", err);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        threadReplies,
        loadThreadReplies,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export const useMessageContext = () => useContext(MessageContext);
