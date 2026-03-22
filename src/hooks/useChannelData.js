import { useEffect, useState } from "react";
import api from "../api/axios";

export default function useChannelData(id, channels) {
  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchChannel = async () => {
      if (!id) return;

      const existing = channels.find(c => c._id === id);

      if (existing) {
        if (mounted) setChannel(existing);
        setLoadingChannel(false);
        return;
      }

      try {
        const res = await api.get(`/channels/${id}`);
        if (mounted) setChannel(res);
      } catch {
        if (mounted) setChannel(null);
      } finally {
        if (mounted) setLoadingChannel(false);
      }
    };

    fetchChannel();
    return () => (mounted = false);

  }, [id, channels]);

  return { channel, loadingChannel };
}