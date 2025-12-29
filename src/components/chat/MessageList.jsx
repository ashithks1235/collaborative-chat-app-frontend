import MessageItem from "./MessageItem";

export default function MessageList({ messages = [] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m, i) => (
        <MessageItem key={i} user={m.user} text={m.text} />
      ))}
    </div>
  );
}
