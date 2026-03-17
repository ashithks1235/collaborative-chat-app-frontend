import { useState, useCallback } from "react";
import api from "../api/axios";

export default function useChannelMessages(channelId, showToast) {

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadMessages = useCallback(async (page = 1) => {

    if (!channelId) return;

    try {

      setLoadingMessages(true);

      const res = await api.get(`/messages/${channelId}`, {
        params: { page, limit: 30 }
      });

      const { messages: newMessages, pagination } = res.data.data;

      if (page === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }

      setPagination(pagination);

    } catch {
      showToast("Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }

  }, [channelId, showToast]);

  return {
    messages,
    setMessages,
    pagination,
    loadingMessages,
    loadMessages
  };
}