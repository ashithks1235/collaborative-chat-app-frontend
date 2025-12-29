import { useParams } from "react-router-dom";
import channels from "../mock/channels";
import MessageList from "../components/chat/MessageList";
import ChatInput from "../components/chat/ChatInput";
import { useUI } from "../context/UIContext";
import { useEffect } from "react";

export default function Channel() {
  const { id } = useParams();
  const { setRightPanel, setActiveChannel } = useUI();

  const channel = channels.find((c) => c.id === id);

  useEffect(() => {
    setRightPanel("thread");
    setActiveChannel(channel?.name);
  }, [id]);

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={channel?.messages || []} />
      <ChatInput />
    </div>
  );
}
