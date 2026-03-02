import { useUI } from "../../context/UIContext";
import { motion } from "framer-motion";

export default function MessageItem({ message }) {
  const { openThread } = useUI();

  /* ===========================
     SAFE MENTION HIGHLIGHT
  =========================== */
  const renderTextWithMentions = (text = "") => {
    return text.split(/(@\w+)/g).map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="text-blue-600 font-semibold"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`border-b pb-3 text-sm transition-all duration-200 
                  hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 ${
        message.optimistic ? "opacity-60" : ""
      }`}
    >
      {/* Sender */}
      <p className="font-semibold text-gray-800 dark:text-gray-100">
        {message.sender?.name || "Unknown"}
      </p>

      {/* Message Text */}
      <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {renderTextWithMentions(message.text)}
      </p>

      {/* Footer */}
      <motion.div
        layout
        className="flex gap-3 items-center mt-2"
      >
        <button
          onClick={() => openThread(message)}
          className="text-xs text-blue-500 hover:underline transition"
        >
          💬 Start thread
        </button>

        {message.replyCount > 0 && (
          <span className="text-xs text-gray-500">
            {message.replyCount} replies
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}