import { useState, useEffect } from "react";
import api from "../../api/axios";
import { FiSend } from "react-icons/fi";

export default function ThreadInput({ parentId, editingReply, setEditingReply }) {

  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (editingReply) {
      setText(editingReply.text);
    }
  }, [editingReply]);

  const sendReply = async () => {
  if (!text.trim()) return;

  try {
    setSending(true);

    if (editingReply) {

      await api.put(`/messages/${editingReply.id}`, {
        text
      });

      setEditingReply(null);

    } else {

      await api.post(`/messages/${parentId}/reply`, {
        text
      });

    }

    setText("");

  } catch {
    console.log("Reply failed");
  }

  setSending(false);
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  return (
    <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">

      <div className="flex items-end gap-2">

        {/* INPUT */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to thread..."
          style={{ maxHeight: "120px" }}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          className="flex-1 resize-none rounded-lg border
          px-3 py-2 text-sm
          dark:bg-gray-800 dark:border-gray-600
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* SEND BUTTON */}
        <button
          onClick={sendReply}
          disabled={sending || !text.trim()}
          className="p-2 rounded-lg bg-blue-500 text-white
          hover:bg-blue-600 transition
          disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSend size={16} />
        </button>

      </div>

    </div>
  );
}