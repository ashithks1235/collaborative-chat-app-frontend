import { useEffect, useState } from "react";
import { getChannelById } from "../api/channel.api";
import { useUI } from "../context/UIContext";

export default function useChannel(channelId) {
  const [channel, setChannel] = useState(null);
  const { setActiveChannel, setRightPanel } = useUI();

  useEffect(() => {
    if (!channelId) return;

    const loadChannel = async () => {
      const data = await getChannelById(channelId);
      setChannel(data);
      setActiveChannel(data.name);
      setRightPanel("thread");
    };

    loadChannel();
  }, [channelId]);

  return channel;
}
