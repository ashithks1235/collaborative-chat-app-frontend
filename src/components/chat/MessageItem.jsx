export default function MessageItem({ user, text }) {
  return (
    <div>
      <p className="font-semibold text-sm">{user}</p>
      <p className="text-gray-700 text-sm">{text}</p>
      <button className="text-xs text-blue-500 mt-1">
        View thread
      </button>
    </div>
  );
}
