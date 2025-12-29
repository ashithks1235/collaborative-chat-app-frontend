export default function ChatInput() {
  return (
    <div className="p-3">
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
        placeholder="Message #general" rows="2"
      />
    </div>
  );
}
